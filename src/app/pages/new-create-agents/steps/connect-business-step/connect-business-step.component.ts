import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-connect-business-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connect-business-step.component.html',
  styleUrls: ['./connect-business-step.component.scss'],
})
export class ConnectBusinessStepComponent {
  private i18nService = inject(I18nService);

  @Input() shopifyConnectedDomain: string | null = null;
  @Input() currentStepNumber = 0;
  @Input() totalSteps = 0;

  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();
  @Output() connectShopifyClicked = new EventEmitter<void>();

  get t() {
    return this.i18nService.getTranslations();
  }

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }
}

