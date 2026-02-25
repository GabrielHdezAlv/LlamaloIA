import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-success-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success-step.component.html',
  styleUrls: ['./success-step.component.scss'],
})
export class SuccessStepComponent {
  private i18nService = inject(I18nService);

  @Output() goToAgentsClicked = new EventEmitter<void>();

  get t() {
    return this.i18nService.getTranslations();
  }
}

