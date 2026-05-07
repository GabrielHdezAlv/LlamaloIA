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

  /** Flujo saliente: mismo eje vertical que campaña / segmentación (sin centrar el bloque en toda la altura). */
  @Input() outboundWizardLayout = false;
  @Input() shopifyConnectedDomain: string | null = null;
  @Input() currentStepNumber = 0;
  @Input() totalSteps = 0;

  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();
  @Output() connectShopifyClicked = new EventEmitter<void>();

  get t() {
    return this.i18nService.getTranslations();
  }

  get rootOuterClass(): string {
    const shell =
      'w-full bg-transparent overflow-hidden mx-auto max-w-4xl 3xl:max-w-7xl pt-8 sm:pt-12 3xl:pt-14 4xl:pt-56';
    if (this.outboundWizardLayout) {
      return `${shell} min-h-0 flex-1 flex flex-col items-center justify-start`;
    }
    return `${shell} h-full flex items-center justify-center 4xl:items-start 4xl:justify-center`;
  }

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }
}

