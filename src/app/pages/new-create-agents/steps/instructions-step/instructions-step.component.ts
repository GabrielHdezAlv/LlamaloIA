import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-instructions-step',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './instructions-step.component.html',
  styleUrls: ['./instructions-step.component.scss'],
})
export class InstructionsStepComponent {
  private i18nService = inject(I18nService);

  @Input() greeting = '';
  @Input() instructions = '';
  @Input() showMakeConfig = false;
  @Input() isMakeConfigClosing = false;
  @Input() makeActionData = { name: '', description: '', serverUrl: '' };
  /** Acción Make guardada y activa en la UI (mock). */
  @Input() makeActionActive = false;
  /** Webhook generado tras guardar (mock). */
  @Input() makeGeneratedWebhook = '';
  /** Si true, Make se muestra como no disponible (solo lectura). */
  @Input() makeIntegrationComingSoon = false;
  @Input() showGeneratePromptModal = false;
  @Input() isGeneratePromptDropdownClosing = false;
  @Input() promptDescription = '';
  @Input() promptEnterpriseName = '';
  @Input() isGeneratingPrompt = false;
  @Input() generatePromptError = '';
  @Input() showExpandInstructionsModal = false;
  @Input() isInstructionsModalClosing = false;
  @Input() currentStepNumber = 0;
  @Input() totalSteps = 0;

  @Output() greetingChange = new EventEmitter<string>();
  @Output() instructionsChange = new EventEmitter<string>();
  @Output() promptDescriptionChange = new EventEmitter<string>();
  @Output() promptEnterpriseNameChange = new EventEmitter<string>();
  @Output() makeActionDataChange = new EventEmitter<any>();
  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();
  @Output() toggleMakeConfigClicked = new EventEmitter<void>();
  @Output() saveMakeActionClicked = new EventEmitter<void>();
  @Output() editMakeActionClicked = new EventEmitter<void>();
  @Output() deleteMakeActionClicked = new EventEmitter<void>();
  @Output() toggleGeneratePromptClicked = new EventEmitter<void>();
  @Output() generatePromptClicked = new EventEmitter<void>();
  @Output() closeGeneratePromptClicked = new EventEmitter<void>();
  @Output() openExpandInstructionsClicked = new EventEmitter<void>();
  @Output() closeExpandInstructionsClicked = new EventEmitter<void>();

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }

  get t() {
    return this.i18nService.getTranslations();
  }

  onGreetingInput(value: string) {
    this.greeting = value;
    this.greetingChange.emit(value);
  }

  onInstructionsInput(value: string) {
    this.instructions = value;
    this.instructionsChange.emit(value);
  }

  onPromptDescriptionInput(value: string) {
    this.promptDescription = value;
    this.promptDescriptionChange.emit(value);
  }

  onPromptEnterpriseNameInput(value: string) {
    this.promptEnterpriseName = value;
    this.promptEnterpriseNameChange.emit(value);
  }

  onMakeActionNameInput(value: string) {
    this.makeActionData = { ...this.makeActionData, name: value };
    this.makeActionDataChange.emit(this.makeActionData);
  }

  onMakeActionDescriptionInput(value: string) {
    this.makeActionData = { ...this.makeActionData, description: value };
    this.makeActionDataChange.emit(this.makeActionData);
  }

  onMakeActionServerUrlInput(value: string) {
    this.makeActionData = { ...this.makeActionData, serverUrl: value };
    this.makeActionDataChange.emit(this.makeActionData);
  }

  async copyMakeWebhook(): Promise<void> {
    const url = this.makeGeneratedWebhook?.trim();
    if (!url || typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  }
}

