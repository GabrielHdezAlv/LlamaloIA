import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../../../core/services/i18n.service';
import type { OutboundCampaignScripts } from '../instructions-step/instructions-step.component';

export type OutboundCampaignKind = keyof OutboundCampaignScripts;

@Component({
  selector: 'app-campaign-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaign-step.component.html',
  styleUrls: ['./campaign-step.component.scss'],
})
export class CampaignStepComponent {
  private i18nService = inject(I18nService);

  /** Orden en rejilla 2×2: fila1 encuesta | carrito, fila2 pago | post-compra. */
  readonly campaignOrder: OutboundCampaignKind[] = [
    'satisfactionSurvey',
    'abandonedCart',
    'paymentReminder',
    'postPurchase',
  ];

  @Input() selectedCampaign: OutboundCampaignKind | null = null;
  @Input() currentStepNumber = 0;
  @Input() totalSteps = 0;

  @Output() selectedCampaignChange = new EventEmitter<OutboundCampaignKind | null>();
  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();

  get t() {
    return this.i18nService.getTranslations();
  }

  campaignLabel(kind: OutboundCampaignKind): string {
    const tr = this.t;
    switch (kind) {
      case 'satisfactionSurvey':
        return tr.outboundTplSatisfactionTitle;
      case 'abandonedCart':
        return tr.outboundTplAbandonedTitle;
      case 'paymentReminder':
        return tr.outboundTplPaymentTitle;
      case 'postPurchase':
        return tr.outboundTplPostPurchaseTitle;
      default:
        return '';
    }
  }

  onSelect(kind: OutboundCampaignKind): void {
    this.selectedCampaignChange.emit(kind);
  }

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }
}
