import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-audio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
})
export class AudioComponent implements AfterViewInit, OnDestroy {
  @ViewChild('audioPlayer', { static: true })
  private audioPlayerRef?: ElementRef<HTMLAudioElement>;
  @ViewChild('waveArea', { static: true })
  private waveAreaRef?: ElementRef<HTMLDivElement>;

  isPlaying = false;
  isReady = true;
  wavePath = '';
  svgWidth = 100;
  svgHeight = 100;

  private readonly isBrowser: boolean;
  private animationFrameId: number | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private timeData: Uint8Array | null = null;
  private smoothData: number[] = [];
  private resizeListener = () => this.resizeCanvas();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.resizeCanvas();
    window.addEventListener('resize', this.resizeListener);
    this.drawIdleLine();
  }

  async playPause(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    const player = this.audioPlayerRef?.nativeElement;
    if (!player) {
      return;
    }

    await this.prepareAudioAnalysis(player);

    if (player.paused) {
      await player.play();
      this.isPlaying = true;
      this.startAnimation();
      return;
    }

    player.pause();
    this.isPlaying = false;
    this.stopAnimation();
    this.drawIdleLine();
  }

  onAudioEnded(): void {
    this.isPlaying = false;
    this.stopAnimation();
    this.drawIdleLine();
  }

  ngOnDestroy(): void {
    this.stopAnimation();
    if (this.isBrowser) {
      window.removeEventListener('resize', this.resizeListener);
    }
    this.sourceNode?.disconnect();
    this.analyser?.disconnect();
    void this.audioContext?.close();
  }

  private async prepareAudioAnalysis(player: HTMLAudioElement): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    if (!this.analyser) {
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.86;
      this.timeData = new Uint8Array(this.analyser.fftSize);
    }

    if (!this.sourceNode) {
      this.sourceNode = this.audioContext.createMediaElementSource(player);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    }
  }

  private startAnimation(): void {
    if (!this.analyser || !this.timeData) {
      return;
    }

    this.stopAnimation();

    const render = () => {
      if (!this.isPlaying || !this.analyser || !this.timeData) {
        return;
      }

      this.analyser.getByteTimeDomainData(this.timeData);
      this.drawSmoothWave(this.timeData);
      this.animationFrameId = requestAnimationFrame(render);
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  private stopAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private resizeCanvas(): void {
    const waveArea = this.waveAreaRef?.nativeElement;
    if (!waveArea) {
      return;
    }
    this.svgWidth = Math.max(10, waveArea.clientWidth);
    this.svgHeight = Math.max(10, waveArea.clientHeight);
  }

  private drawIdleLine(): void {
    const centerY = this.svgHeight * 0.35;
    const startX = this.svgWidth * 0.25;
    const endX = this.svgWidth * 0.75;
    this.wavePath = `M ${startX} ${centerY} L ${endX} ${centerY}`;
  }

  private drawSmoothWave(data: Uint8Array): void {
    const centerY = this.svgHeight * 0.35;
    const startX = this.svgWidth * 0.25;
    const endX = this.svgWidth * 0.75;
    const drawableWidth = endX - startX;
    const pointsCount = 96;
    const maxAmplitude = this.svgHeight * 0.48;
    const noiseGate = 0.065;
    const gateSoftness = 0.03;
    const points: Array<{ x: number; y: number }> = [];

    if (this.smoothData.length !== pointsCount + 1) {
      this.smoothData = Array.from({ length: pointsCount + 1 }, () => 0);
    }

    for (let i = 0; i <= pointsCount; i++) {
      const x = startX + (i / pointsCount) * drawableWidth;
      const dataIndex = Math.floor((i / pointsCount) * (data.length - 1));
      const normalized = (data[dataIndex] - 128) / 128;
      const abs = Math.abs(normalized);

      // Puerta de ruido suave: elimina temblor de fondo en silencios.
      const gated =
        abs <= noiseGate
          ? 0
          : Math.sign(normalized) *
            ((abs - noiseGate) / (1 - noiseGate + gateSoftness));
      const boosted = Math.max(-1.25, Math.min(1.25, gated * 4.4));

      const blend = Math.abs(boosted) < 0.02 ? 0.14 : 0.42;
      this.smoothData[i] = this.smoothData[i] * (1 - blend) + boosted * blend;

      const envelope = Math.pow(Math.sin((i / pointsCount) * Math.PI), 1.15);
      const y = centerY + this.smoothData[i] * maxAmplitude * envelope;
      points.push({ x, y });
    }

    this.wavePath = this.buildSmoothPath(points);
  }

  private buildSmoothPath(points: Array<{ x: number; y: number }>): string {
    if (points.length === 0) {
      return '';
    }

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const current = points[i];
      const controlX = (prev.x + current.x) / 2;
      path += ` Q ${controlX} ${prev.y} ${current.x} ${current.y}`;
    }
    return path;
  }
}
