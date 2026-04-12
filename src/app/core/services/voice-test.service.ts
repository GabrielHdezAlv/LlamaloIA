import { Injectable, signal, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NotificationService } from './notification.service';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VoiceTestConfig {
  agentInstruction: string;
  firstInteraction: string;
  language: string;
  name: string;
  voiceId: string;
  parameters: {
    stability: number;
    similarity: number;
    style: number;
    boost: boolean;
    speed: number;
  };
  shopifyDomain?: string;
  /** Si true, usa /support/chat y session.start solo con token (backend usa config guardada). */
  useSupportChat?: boolean;
}

export interface TranscriptMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  isFinal?: boolean;
}

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error' | 'ended';
type AgentState = 'idle' | 'thinking' | 'speaking' | 'done';

@Injectable({ providedIn: 'root' })
export class VoiceTestService {
  private platformId = inject(PLATFORM_ID);
  private notificationService = inject(NotificationService);

  readonly connectionState = signal<ConnectionState>('idle');
  readonly agentState = signal<AgentState>('idle');
  readonly transcripts = signal<TranscriptMessage[]>([]);
  readonly errorMessage = signal<string>('');
  readonly isMuted = signal<boolean>(false);
  readonly remainingSeconds = signal<number>(120);
  readonly sessionEndReason = signal<string>('');
  /** Timestamp del último audio recibido del agente (para animar la esfera). */
  readonly lastAgentAudioAt = signal<number>(0);

  private ws: WebSocket | null = null;
  private mediaStream: MediaStream | null = null;
  private captureContext: AudioContext | null = null;
  private playbackContext: AudioContext | null = null;
  private captureWorklet: AudioWorkletNode | null = null;
  private playbackWorklet: AudioWorkletNode | null = null;
  private playbackAnalyser: AnalyserNode | null = null;
  private captureProcessor: ScriptProcessorNode | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private captureSampleRate = 16000;
  private playbackSampleRate = 16000;
  private isSending = true;
  private incomingAudioBuffer = new Uint8Array(0);
  private ignoreIncomingAudio = false;
  private isSupportChatSession = false;

  // Observable para notificar cuando el agente ha terminado la llamada por sí mismo (e.g. con [END_CALL])
  public readonly agentHangup$ = new Subject<void>();

  // Volumen de reproducción (0.0 - 1.0), controlado desde el widget Xenon
  private playbackGain = 1.0;

  private readonly MAX_DURATION = 120;

  private httpBaseToWs(httpBase: string): string {
    const b = httpBase.replace(/\/$/, '');
    return b
      .replace(/^https:\/\//, 'wss://')
      .replace(/^http:\/\//, 'ws://');
  }

  private get wsUrlVoiceTest(): string {
    return `${this.httpBaseToWs(environment.apiUrl)}/voice/test-stream`;
  }

  private get wsUrlSupportChat(): string {
    return `${this.httpBaseToWs(environment.apiUrl)}/support/chat`;
  }

  constructor() {
    effect(() => {
      const state = this.connectionState();
      const reason = this.sessionEndReason();
      const error = this.errorMessage();

      if (state === 'ended' && reason) {
        this.notificationService.info(this.getEndReasonText(reason));
      } else if (state === 'error' && error) {
        this.notificationService.error(error);
      }
    });
  }

  // Permite ajustar el volumen de reproducción desde otros componentes (0-1)
  setPlaybackVolume(gain: number): void {
    const clamped = Math.max(0, Math.min(1, gain));
    this.playbackGain = clamped;
    if (this.playbackWorklet) {
      this.playbackWorklet.port.postMessage({
        type: 'setGain',
        gain: clamped,
      });
    }
  }

  /**
   * Nivel actual del audio que está sonando (salida del agente). 0-1.
   * Para animar la esfera según lo que se escucha.
   */
  getPlaybackLevel(): number {
    if (!this.playbackAnalyser) return 0;
    const data = new Uint8Array(this.playbackAnalyser.frequencyBinCount);
    this.playbackAnalyser.getByteFrequencyData(data);
    let max = 0;
    for (let i = 0; i < data.length; i++) max = Math.max(max, data[i]);
    const n = Math.min(1, Math.pow(max / 255, 0.5) * 1.3);
    return n;
  }

  private getEndReasonText(reason: string): string {
    switch (reason) {
      case 'timeout':
        return 'La prueba ha finalizado porque se alcanzó el tiempo máximo de 2 minutos.';
      case 'user':
        return 'Has finalizado la prueba.';
      case 'disconnect':
        return 'La conexión se ha perdido.';
      case 'replaced':
        return 'La sesión fue reemplazada por otra prueba.';
      case 'error':
        return 'La sesión finalizó debido a un error.';
      default:
        return 'La prueba ha finalizado.';
    }
  }

  async startSession(config: VoiceTestConfig): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    this.resetState();
    // Si es una sesión del asistente de soporte, marcamos la flag global.
    // Si no lo es, NO desmarcamos una sesión de soporte que ya estuviera activa.
    if (config.useSupportChat === true) {
      this.isSupportChatSession = true;
    }
    this.connectionState.set('connecting');
    this.isSending = true;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      await this.setupPlaybackContext();
      await this.setupCaptureContext();

      const token = localStorage.getItem('token') || '';
      this.connectWebSocket(token, config);
    } catch (err: any) {
      this.connectionState.set('error');
      if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') {
        this.errorMessage.set(
          'Permiso de micrófono denegado. Por favor, permite el acceso al micrófono en tu navegador.',
        );
      } else {
        this.errorMessage.set(
          'Error al iniciar la prueba de voz: ' +
          (err.message || 'Error desconocido'),
        );
      }
      this.cleanup();
    }
  }

  toggleMute(): void {
    const muted = !this.isMuted();
    this.isMuted.set(muted);
    this.isSending = !muted;
    this.mediaStream?.getAudioTracks().forEach((t) => (t.enabled = !muted));
  }

  endSession(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'session.end' }));
    }
    this.sessionEndReason.set('user');
    this.connectionState.set('ended');
    this.cleanup();
  }

  clearAgentAudio(): void {
    if (this.playbackWorklet) {
      // 1. Limpia los buffers ya cargados en el hilo de audio del navegador
      this.playbackWorklet.port.postMessage({ type: 'clear' });
    }
    // 2. Limpia los buffers locales de datos entrantes
    this.incomingAudioBuffer = new Uint8Array(0);
    // 3. Activa el bloqueo de audio antiguo hasta que llegue la siguiente respuesta
    this.ignoreIncomingAudio = true;
    console.log('[VoiceTest] Audio limpiado y bloqueo de entrada activado');
  }

  reset(): void {
    this.cleanup();
    this.resetState();
  }

  /**
   * Resetea la sesión solo si no es una sesión del asistente de soporte (Xenon).
   * Útil para que al destruir componentes de prueba de agente no se corte
   * una llamada global de soporte que esté en curso.
   */
  resetIfNotSupportChat(): void {
    if (this.isSupportChatSession) {
      // Hay una sesión global de soporte activa (Xenon), no tocarla.
      return;
    }
    this.reset();
  }

  // ──────── WebSocket ────────

  private connectWebSocket(token: string, config: VoiceTestConfig): void {
    const useSupportChat = config.useSupportChat === true;
    const url = useSupportChat ? this.wsUrlSupportChat : this.wsUrlVoiceTest;
    this.ws = new WebSocket(url);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      if (useSupportChat) {
        this.ws!.send(JSON.stringify({ type: 'session.start', token }));
      } else {
        const startMsg = {
          type: 'session.start',
          token,
          config: {
            agentInstruction: config.agentInstruction,
            firstInteraction: config.firstInteraction,
            language: config.language,
            name: config.name,
            voiceId: config.voiceId,
            parameters: config.parameters,
            ...(config.shopifyDomain
              ? { shopifyDomain: config.shopifyDomain }
              : {}),
          },
        };
        this.ws!.send(JSON.stringify(startMsg));
      }
    };

    this.ws.onmessage = (event: MessageEvent) => {
      if (event.data instanceof ArrayBuffer) {
        this.debugBinaryFrame(event.data);
        this.handleBinaryAudio(event.data);
      } else if (event.data instanceof Blob) {
        // Algunos servidores envían Blob en lugar de ArrayBuffer
        (event.data as Blob).arrayBuffer().then((buf) => {
          this.debugBinaryFrame(buf);
          this.handleBinaryAudio(buf);
        });
      } else {
        try {
          const msg = JSON.parse(event.data as string);
          this.handleJsonMessage(msg);
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      }
    };

    this.ws.onerror = () => {
      if (this.connectionState() === 'connecting') {
        this.connectionState.set('error');
        this.errorMessage.set(
          'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        );
      }
    };

    this.ws.onclose = () => {
      if (
        this.connectionState() !== 'ended' &&
        this.connectionState() !== 'error'
      ) {
        this.connectionState.set('ended');
        this.sessionEndReason.set('disconnect');
      }
      this.cleanup();
    };
  }

  private handleJsonMessage(msg: any): void {
    switch (msg.type) {
      case 'session.ready':
        this.connectionState.set('connected');
        this.startTimer();
        break;

      case 'clear_audio':
        console.log('[VoiceTest] Recibido evento clear_audio - Interrumpiendo agente');
        this.clearAgentAudio();
        this.agentState.set('idle');
        // Un seguro por si el backend no enviara transcript.start tras el clear_audio
        setTimeout(() => { if (this.ignoreIncomingAudio) this.ignoreIncomingAudio = false; }, 1000);
        break;

      case 'transcript.start':
        if (msg.role === 'assistant') {
          this.ignoreIncomingAudio = false;
          this.transcripts.update((t) => [
            ...t,
            { role: 'assistant', text: '', timestamp: Date.now(), isFinal: false },
          ]);
        }
        break;

      case 'transcript.delta':
        this.transcripts.update((t) => {
          if (t.length === 0) return t;
          const last = t[t.length - 1];
          if (last.role === 'assistant' && !last.isFinal) {
            const updated = [...t];
            updated[t.length - 1] = {
              ...last,
              text: last.text + (msg.text || ''),
            };
            return updated;
          }
          return t;
        });
        break;

      case 'transcript':
        this.transcripts.update((t) => {
          // If it's assistant and we were streaming, update the last one
          if (msg.role === 'assistant') {
            const lastIdx = t.length - 1;
            if (lastIdx >= 0 && t[lastIdx].role === 'assistant' && !t[lastIdx].isFinal) {
              const updated = [...t];
              updated[lastIdx] = {
                ...t[lastIdx],
                text: msg.text, // Backend provides full text
                isFinal: true,
              };
              return updated;
            }
          }

          // If it's a new message (user or non-streaming assistant)
          return [
            ...t,
            { role: msg.role, text: msg.text, timestamp: Date.now(), isFinal: true },
          ];
        });
        break;

      case 'agent.thinking':
        this.agentState.set('thinking');
        break;

      case 'agent.speaking':
        this.agentState.set('speaking');
        break;

      case 'agent.done':
        this.agentState.set('done');
        break;

      case 'error':
        this.errorMessage.set(msg.message || 'Error desconocido');
        break;

      case 'session.ended':
        this.connectionState.set('ended');
        this.sessionEndReason.set(msg.reason || 'unknown');
        // Si la razón es agent_hangup, emitir la señal para que el componente de UI reaccione
        if (msg.reason === 'agent_hangup') {
          this.agentHangup$.next();
        }
        this.cleanup();
        break;
    }
  }

  // ──────── Debug (quitar en producción) ────────

  private debugFrameCount = 0;
  private debugBinaryFrame(buffer: ArrayBuffer): void {
    this.debugFrameCount++;
    if (this.debugFrameCount <= 5) {
      const bytes = new Uint8Array(buffer);
      const header = Array.from(bytes.slice(0, 16))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ');
      console.log(
        `[VoiceTest] Binary frame #${this.debugFrameCount}: ` +
        `${buffer.byteLength} bytes, ` +
        `playbackRate=${this.playbackSampleRate}Hz, ` +
        `header=[${header}]`,
      );
    }
  }

  // ──────── Audio Playback ────────

  private handleBinaryAudio(buffer: ArrayBuffer): void {
    if (!this.playbackWorklet || !this.playbackContext) return;

    // Si estamos en medio de una interrupción, ignoramos el audio residual
    if (this.ignoreIncomingAudio) {
      // console.log('[VoiceTest] Ignorando audio residual tras interrupción');
      return;
    }

    // Al recibir audio real, nos aseguramos que el estado visual sea 'speaking'
    if (this.agentState() !== 'speaking') {
      this.agentState.set('speaking');
    }
    this.lastAgentAudioAt.set(Date.now());

    if (this.playbackContext.state === 'suspended') {
      this.playbackContext.resume();
    }

    // Acumular bytes entrantes con el residuo anterior
    const incoming = new Uint8Array(buffer);
    const merged = new Uint8Array(
      this.incomingAudioBuffer.length + incoming.length,
    );
    merged.set(this.incomingAudioBuffer, 0);
    merged.set(incoming, this.incomingAudioBuffer.length);

    // Procesar solo samples Int16 completos (2 bytes cada uno)
    const usableBytes = merged.length - (merged.length % 2);
    if (usableBytes < 2) {
      this.incomingAudioBuffer = merged;
      return;
    }

    // Guardar el byte sobrante para el próximo frame
    this.incomingAudioBuffer =
      usableBytes < merged.length
        ? merged.slice(usableBytes)
        : new Uint8Array(0);

    const int16 = new Int16Array(
      merged.buffer,
      merged.byteOffset,
      usableBytes / 2,
    );
    let float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }

    if (this.playbackSampleRate !== 16000) {
      float32 = this.resample(float32, 16000, this.playbackSampleRate);
    }

    this.playbackWorklet.port.postMessage({
      type: 'enqueue',
      samples: float32,
    });
  }

  private async setupPlaybackContext(): Promise<void> {
    try {
      this.playbackContext = new AudioContext({ sampleRate: 16000 });
    } catch {
      this.playbackContext = new AudioContext();
    }
    this.playbackSampleRate = this.playbackContext.sampleRate;

    try {
      await this.playbackContext.audioWorklet.addModule(
        'assets/workers/audio-playback-processor.js',
      );
      this.playbackWorklet = new AudioWorkletNode(
        this.playbackContext,
        'audio-playback-processor',
      );
      // Configurar pre-buffer y volumen inicial
      const prebufferSamples = Math.round(this.playbackSampleRate * 0.25);
      this.playbackWorklet.port.postMessage({
        type: 'configure',
        prebufferSize: prebufferSamples,
      });
      this.playbackWorklet.port.postMessage({
        type: 'setGain',
        gain: this.playbackGain,
      });
      this.playbackAnalyser = this.playbackContext.createAnalyser();
      this.playbackAnalyser.fftSize = 256;
      this.playbackAnalyser.smoothingTimeConstant = 0.4;
      this.playbackWorklet.connect(this.playbackAnalyser);
      this.playbackAnalyser.connect(this.playbackContext.destination);
    } catch (e) {
      console.warn('AudioWorklet for playback not available:', e);
    }
  }

  // ──────── Audio Capture ────────

  private async setupCaptureContext(): Promise<void> {
    this.captureContext = new AudioContext();
    
    // IMPORTANTE: Algunos navegadores inician el contexto suspendido.
    // Si no lo reanudamos, el micrófono no enviará audio al servidor
    // y la interrupción nunca funcionará porque el servidor no nos escuchará.
    if (this.captureContext.state === 'suspended') {
      await this.captureContext.resume();
    }

    this.captureSampleRate = this.captureContext.sampleRate;
    const source = this.captureContext.createMediaStreamSource(
      this.mediaStream!,
    );

    try {
      await this.captureContext.audioWorklet.addModule(
        'assets/workers/audio-capture-processor.js',
      );
      this.captureWorklet = new AudioWorkletNode(
        this.captureContext,
        'audio-capture-processor',
      );
      this.captureWorklet.port.onmessage = (event: MessageEvent) => {
        if (
          event.data.type === 'audio' &&
          this.isSending &&
          this.ws?.readyState === WebSocket.OPEN
        ) {
          const samples = event.data.samples as Float32Array;
          this.checkLocalBargeIn(samples);
          this.sendAudioChunk(samples);
        }
      };
      source.connect(this.captureWorklet);
      this.captureWorklet.connect(this.captureContext.destination);
    } catch {
      console.warn(
        'AudioWorklet not supported for capture, using ScriptProcessorNode',
      );
      const bufferSize = 4096;
      this.captureProcessor = this.captureContext.createScriptProcessor(
        bufferSize,
        1,
        1,
      );
      this.captureProcessor.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!this.isSending || this.ws?.readyState !== WebSocket.OPEN) return;
        const samples = new Float32Array(e.inputBuffer.getChannelData(0));
        this.checkLocalBargeIn(samples);
        this.sendAudioChunk(samples);
      };
      source.connect(this.captureProcessor);
      this.captureProcessor.connect(this.captureContext.destination);
    }
  }

  private checkLocalBargeIn(samples: Float32Array): void {
    // Solo actuamos si el agente está hablando
    if (this.agentState() !== 'speaking') return;

    // Calculamos el nivel RMS del audio capturado (volumen del usuario)
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    const rms = Math.sqrt(sum / samples.length);

    // Umbral de sensibilidad para la interrupción automática local
    // 0.05 es un valor estándar para voz; si se interrumpe con ruido bajar a 0.08
    const threshold = 0.05;

    if (rms > threshold) {
      console.log('[VoiceTest] Interrupción automática local detectada (RMS:', rms.toFixed(4), ')');
      this.clearAgentAudio();
      this.agentState.set('idle');

      // Notificamos al backend de la interrupción manual si es necesario
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'user.interruption' }));
      }
    }
  }

  private sendAudioChunk(float32: Float32Array): void {
    let samples = float32;
    if (this.captureSampleRate !== 16000) {
      samples = this.resample(float32, this.captureSampleRate, 16000);
    }

    const int16 = this.float32ToInt16(samples);
    const base64 = this.arrayBufferToBase64(int16.buffer);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'audio', data: base64 }));
    }
  }

  // ──────── Conversions ────────

  private float32ToInt16(float32Array: Float32Array): Int16Array {
    const int16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16;
  }

  private resample(
    input: Float32Array,
    fromRate: number,
    toRate: number,
  ): Float32Array {
    const ratio = fromRate / toRate;
    const outputLength = Math.round(input.length / ratio);
    const output = new Float32Array(outputLength);
    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * ratio;
      const floor = Math.floor(srcIndex);
      const frac = srcIndex - floor;
      const a = input[floor] || 0;
      const b = input[Math.min(floor + 1, input.length - 1)] || 0;
      output[i] = a + frac * (b - a);
    }
    return output;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      for (let j = 0; j < chunk.length; j++) {
        binary += String.fromCharCode(chunk[j]);
      }
    }
    return btoa(binary);
  }

  // ──────── Timer ────────

  private startTimer(): void {
    const startTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, this.MAX_DURATION - elapsed);
      this.remainingSeconds.set(remaining);
      if (remaining <= 0) {
        this.stopTimer();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ──────── Cleanup ────────

  cleanup(): void {
    this.stopTimer();
    this.incomingAudioBuffer = new Uint8Array(0);
    this.debugFrameCount = 0;

    if (this.ws) {
      const wsRef = this.ws;
      this.ws = null;
      if (
        wsRef.readyState === WebSocket.OPEN ||
        wsRef.readyState === WebSocket.CONNECTING
      ) {
        wsRef.onclose = null;
        wsRef.close();
      }
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }

    if (this.captureWorklet) {
      this.captureWorklet.port.postMessage({ type: 'stop' });
      this.captureWorklet.disconnect();
      this.captureWorklet = null;
    }
    if (this.captureProcessor) {
      this.captureProcessor.disconnect();
      this.captureProcessor = null;
    }
    if (this.captureContext && this.captureContext.state !== 'closed') {
      this.captureContext.close().catch(() => { });
      this.captureContext = null;
    }

    if (this.playbackWorklet) {
      this.playbackWorklet.port.postMessage({ type: 'clear' });
      this.playbackWorklet.disconnect();
      this.playbackWorklet = null;
    }
    if (this.playbackAnalyser) {
      this.playbackAnalyser.disconnect();
      this.playbackAnalyser = null;
    }
    if (this.playbackContext && this.playbackContext.state !== 'closed') {
      this.playbackContext.close().catch(() => { });
      this.playbackContext = null;
    }
  }

  private resetState(): void {
    this.connectionState.set('idle');
    this.agentState.set('idle');
    this.lastAgentAudioAt.set(0);
    this.transcripts.set([]);
    this.errorMessage.set('');
    this.isMuted.set(false);
    this.remainingSeconds.set(this.MAX_DURATION);
    this.sessionEndReason.set('');
  }
}
