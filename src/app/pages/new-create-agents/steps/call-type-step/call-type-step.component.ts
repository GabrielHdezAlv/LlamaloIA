import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-call-type-step',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './call-type-step.component.html',
  styleUrls: ['./call-type-step.component.scss'],
})
export class CallTypeStepComponent {
  private i18nService = inject(I18nService);

  @Input() selectedCallType: 'inbound' | 'outbound' | null = null;
  @Input() currentStepNumber = 0;
  @Input() totalSteps = 0;

  @Output() callTypeChange = new EventEmitter<'inbound' | 'outbound' | null>();
  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();

  get t() {
    return this.i18nService.getTranslations();
  }

  onSelectCallType(type: 'inbound' | 'outbound') {
    this.selectedCallType = this.selectedCallType === type ? null : type;
    this.callTypeChange.emit(this.selectedCallType);
  }

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }
}

