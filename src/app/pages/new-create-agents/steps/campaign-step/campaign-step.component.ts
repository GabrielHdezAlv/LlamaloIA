import { Component, Input, Output, EventEmitter, inject, HostBinding } from '@angular/core';
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

  @HostBinding('class.flex')
  readonly hostFlex = true;
  @HostBinding('class.flex-col')
  readonly hostFlexCol = true;
  @HostBinding('class.min-h-0')
  readonly hostMinH0 = true;
  @HostBinding('class.flex-1')
  readonly hostFlex1 = true;
  @HostBinding('class.overflow-hidden')
  readonly hostOverflowHidden = true;

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

  readonly rootClass =
    'w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-transparent box-border mx-auto max-w-4xl 3xl:max-w-7xl pt-8 sm:pt-12 3xl:pt-14 4xl:pt-56 items-center justify-start 4xl:items-start 4xl:justify-start';

  readonly innerClass =
    'w-full max-w-[560px] sm:max-w-[640px] md:max-w-[780px] xl:max-w-[740px] 3xl:max-w-[880px] px-5 sm:px-6 md:px-7 xl:px-6 3xl:px-8 flex min-h-0 flex-col overflow-visible pb-6 max-lg:pb-8';

  readonly bodyClass = 'pb-12 max-lg:pb-28 3xl:pb-14';

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
