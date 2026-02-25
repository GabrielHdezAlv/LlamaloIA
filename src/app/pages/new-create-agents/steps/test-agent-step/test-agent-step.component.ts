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
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiSphereComponent } from '../../../../shared/components/ai-sphere/ai-sphere.component';
import {
  VoiceTestService,
  VoiceTestConfig,
  TranscriptMessage,
} from '../../../../core/services/voice-test.service';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-test-agent-step',
  standalone: true,
  imports: [CommonModule, AiSphereComponent],
  templateUrl: './test-agent-step.component.html',
  styleUrls: ['./test-agent-step.component.scss'],
})
export class TestAgentStepComponent implements OnInit, OnDestroy {
  private i18nService = inject(I18nService);

  @Input() currentStepNumber = 0;
  @Input() totalSteps = 0;
  @Input() isMicrophoneActive = false;

  @Input() agentInstruction = '';
  @Input() firstInteraction = '';
  @Input() language = 'es';
  @Input() agentName = '';
  @Input() voiceId = '';
  @Input() voiceParameters: {
    stability: number;
    similarity: number;
    style: number;
    boost: boolean;
    speed: number;
  } = { stability: 0.72, similarity: 0.8, style: 0.05, boost: true, speed: 0.98 };
  @Input() shopifyDomain?: string;

  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();

  @ViewChild('transcriptContainer') transcriptContainer!: ElementRef<HTMLDivElement>;

  readonly voiceTest = inject(VoiceTestService);

  audioLevel = 0;
  private animationFrame: number | null = null;

  constructor() {
    effect(() => {
      const transcripts = this.voiceTest.transcripts();
      if (transcripts.length > 0) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  ngOnInit(): void {
    this.animateIdlePulse();
  }

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.voiceTest.reset();
  }

  startCall(): void {
    const config: VoiceTestConfig = {
      agentInstruction: this.agentInstruction,
      firstInteraction: this.firstInteraction,
      language: this.language,
      name: this.agentName,
      voiceId: this.voiceId,
      parameters: this.voiceParameters,
      ...(this.shopifyDomain ? { shopifyDomain: this.shopifyDomain } : {}),
    };
    this.voiceTest.startSession(config);
  }

  endCall(): void {
    this.voiceTest.endSession();
  }

  toggleMute(): void {
    this.voiceTest.toggleMute();
  }

  restartCall(): void {
    this.voiceTest.reset();
    this.startCall();
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  get t() {
    return this.i18nService.getTranslations();
  }

  getAgentStateText(): string {
    switch (this.voiceTest.agentState()) {
      case 'thinking':
        return this.t.agentStateThinking;
      case 'speaking':
        return this.t.agentStateSpeaking;
      case 'done':
        return this.t.agentStateDone;
      default:
        return this.t.agentStateWaiting;
    }
  }

  getConnectionStateText(): string {
    switch (this.voiceTest.connectionState()) {
      case 'connecting':
        return this.t.connectionConnecting;
      case 'connected':
        return this.t.connected;
      case 'error':
        return this.t.statusError;
      case 'ended':
        return this.t.connectionEnded;
      default:
        return '';
    }
  }



  scrollToBottom(): void {
    if (this.transcriptContainer?.nativeElement) {
      const el = this.transcriptContainer.nativeElement;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  trackByTimestamp(_index: number, msg: TranscriptMessage): number {
    return msg.timestamp;
  }

  get isCallActive(): boolean {
    const state = this.voiceTest.connectionState();
    return state === 'connecting' || state === 'connected';
  }

  get isCallEnded(): boolean {
    const state = this.voiceTest.connectionState();
    return state === 'ended' || state === 'error';
  }

  get isIdle(): boolean {
    return this.voiceTest.connectionState() === 'idle';
  }

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }

  /** Anima la esfera según el estado del agente (habla, piensa, idle) */
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
