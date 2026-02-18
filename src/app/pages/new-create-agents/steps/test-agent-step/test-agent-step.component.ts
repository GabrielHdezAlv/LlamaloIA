import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiSphereComponent } from '../../../../shared/components/ai-sphere/ai-sphere.component';
import { VoiceTestCallComponent } from '../../../../shared/components/voice-test-call/voice-test-call.component';

@Component({
  selector: 'app-test-agent-step',
  standalone: true,
  imports: [CommonModule, AiSphereComponent, VoiceTestCallComponent],
  templateUrl: './test-agent-step.component.html',
  styleUrls: ['./test-agent-step.component.scss'],
})
export class TestAgentStepComponent {
  @Input() currentStepNumber = 0;
  @Input() totalSteps = 0;
  @Input() audioLevel = 0;
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
  @Output() toggleMicrophoneClicked = new EventEmitter<void>();

  showVoiceTest = false;

  openVoiceTest(): void {
    this.showVoiceTest = true;
  }

  closeVoiceTest(): void {
    this.showVoiceTest = false;
  }

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }
}

