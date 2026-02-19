import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiSphereComponent } from '../ai-sphere/ai-sphere.component';
import {
  VoiceTestService,
  VoiceTestConfig,
  TranscriptMessage,
} from '../../../core/services/voice-test.service';

@Component({
  selector: 'app-voice-test-call',
  standalone: true,
  imports: [CommonModule, AiSphereComponent],
  templateUrl: './voice-test-call.component.html',
  styleUrls: ['./voice-test-call.component.scss'],
})
export class VoiceTestCallComponent implements OnInit, OnDestroy {
  @Input() agentInstruction = '';
  @Input() firstInteraction = '';
  @Input() language = 'es';
  @Input() agentName = '';
  @Input() voiceId = '';
  @Input() parameters: {
    stability: number;
    similarity: number;
    style: number;
    boost: boolean;
    speed: number;
  } = { stability: 0.72, similarity: 0.8, style: 0.05, boost: true, speed: 0.98 };
  @Input() shopifyDomain?: string;

  @Output() closed = new EventEmitter<void>();

  @ViewChild('transcriptContainer') transcriptContainer!: ElementRef<HTMLDivElement>;

  readonly voiceTest = inject(VoiceTestService);

  private animationFrame: number | null = null;
  audioLevel = 0;
  isClosing = false;

  ngOnInit(): void {
    const config: VoiceTestConfig = {
      agentInstruction: this.agentInstruction,
      firstInteraction: this.firstInteraction,
      language: this.language,
      name: this.agentName,
      voiceId: this.voiceId,
      parameters: this.parameters,
      ...(this.shopifyDomain ? { shopifyDomain: this.shopifyDomain } : {}),
    };
    this.voiceTest.startSession(config);
    this.animateIdlePulse();
  }

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.voiceTest.reset();
  }

  onToggleMute(): void {
    this.voiceTest.toggleMute();
  }

  onEndCall(): void {
    this.isClosing = true;
    this.voiceTest.endSession();
    setTimeout(() => this.closed.emit(), 300);
  }

  onClose(): void {
    this.isClosing = true;
    this.voiceTest.endSession();
    setTimeout(() => this.closed.emit(), 300);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  getAgentStateText(): string {
    switch (this.voiceTest.agentState()) {
      case 'thinking':
        return 'Pensando...';
      case 'speaking':
        return 'Hablando...';
      case 'done':
        return 'Listo';
      default:
        return 'Esperando...';
    }
  }

  getConnectionStateText(): string {
    switch (this.voiceTest.connectionState()) {
      case 'connecting':
        return 'Conectando...';
      case 'connected':
        return 'Conectado';
      case 'error':
        return 'Error';
      case 'ended':
        return 'Finalizado';
      default:
        return '';
    }
  }



  scrollToBottom(): void {
    try {
      if (this.transcriptContainer?.nativeElement) {
        const el = this.transcriptContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    } catch { }
  }

  trackByTimestamp(_index: number, msg: TranscriptMessage): number {
    return msg.timestamp;
  }

  private animateIdlePulse(): void {
    const animate = () => {
      const state = this.voiceTest.agentState();
      if (state === 'speaking') {
        this.audioLevel = 0.3 + Math.sin(Date.now() / 150) * 0.25 + Math.sin(Date.now() / 80) * 0.15;
      } else if (state === 'thinking') {
        this.audioLevel = 0.15 + Math.sin(Date.now() / 600) * 0.1;
      } else {
        this.audioLevel = Math.sin(Date.now() / 1000) * 0.15 + 0.08;
      }
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }
}
