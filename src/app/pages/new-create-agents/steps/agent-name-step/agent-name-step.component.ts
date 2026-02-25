import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-agent-name-step',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './agent-name-step.component.html',
  styleUrls: ['./agent-name-step.component.scss'],
})
export class AgentNameStepComponent {
  private i18nService = inject(I18nService);

  @Input() agentName = '';
  @Input() currentStepNumber = 0;
  @Input() totalSteps = 0;

  @Output() agentNameChange = new EventEmitter<string>();
  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();

  get t() {
    return this.i18nService.getTranslations();
  }

  onAgentNameInput(value: string) {
    this.agentName = value;
    this.agentNameChange.emit(value);
  }

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }
}

