import { Injectable, signal, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NotificationService } from './notification.service';

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
}

export interface TranscriptMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
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

  private ws: WebSocket | null = null;
  private mediaStream: MediaStream | null = null;
  private captureContext: AudioContext | null = null;
  private playbackContext: AudioContext | null = null;
  private captureWorklet: AudioWorkletNode | null = null;
  private playbackWorklet: AudioWorkletNode | null = null;
  private captureProcessor: ScriptProcessorNode | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private captureSampleRate = 16000;
  private playbackSampleRate = 16000;
  private isSending = true;
  private incomingAudioBuffer = new Uint8Array(0);

  private readonly WS_URL =
    'wss://llamaloiabackend-5294.onrender.com/voice/test-stream';
  private readonly MAX_DURATION = 120;

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

  reset(): void {
    this.cleanup();
    this.resetState();
  }

  // ──────── WebSocket ────────

  private connectWebSocket(token: string, config: VoiceTestConfig): void {
    this.ws = new WebSocket(this.WS_URL);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
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

      case 'transcript':
        this.transcripts.update((t) => [
          ...t,
          { role: msg.role, text: msg.text, timestamp: Date.now() },
        ]);
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
      // Pre-buffer de ~250ms antes de empezar a reproducir
      const prebufferSamples = Math.round(this.playbackSampleRate * 0.25);
      this.playbackWorklet.port.postMessage({
        type: 'configure',
        prebufferSize: prebufferSamples,
      });
      this.playbackWorklet.connect(this.playbackContext.destination);
    } catch (e) {
      console.warn('AudioWorklet for playback not available:', e);
    }
  }

  // ──────── Audio Capture ────────

  private async setupCaptureContext(): Promise<void> {
    this.captureContext = new AudioContext();

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
          this.sendAudioChunk(event.data.samples as Float32Array);
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
        this.sendAudioChunk(new Float32Array(e.inputBuffer.getChannelData(0)));
      };
      source.connect(this.captureProcessor);
      this.captureProcessor.connect(this.captureContext.destination);
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
    if (this.playbackContext && this.playbackContext.state !== 'closed') {
      this.playbackContext.close().catch(() => { });
      this.playbackContext = null;
    }
  }

  private resetState(): void {
    this.connectionState.set('idle');
    this.agentState.set('idle');
    this.transcripts.set([]);
    this.errorMessage.set('');
    this.isMuted.set(false);
    this.remainingSeconds.set(this.MAX_DURATION);
    this.sessionEndReason.set('');
  }
}
