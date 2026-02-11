import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiSphereComponent } from '../../../../shared/components/ai-sphere/ai-sphere.component';

@Component({
  selector: 'app-test-agent-step',
  standalone: true,
  imports: [CommonModule, AiSphereComponent],
  templateUrl: './test-agent-step.component.html',
  styleUrls: ['./test-agent-step.component.scss'],
})
export class TestAgentStepComponent {
  @Input() currentStepNumber = 0;
  @Input() totalSteps = 0;
  @Input() audioLevel = 0;
  @Input() isMicrophoneActive = false;

  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();
  @Output() toggleMicrophoneClicked = new EventEmitter<void>();

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }
}

