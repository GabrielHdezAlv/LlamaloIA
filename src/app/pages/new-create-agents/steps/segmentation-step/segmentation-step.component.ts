import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  HostBinding,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../../../core/services/i18n.service';
import type { OutboundCampaignKind } from '../campaign-step/campaign-step.component';
import {
  SegmentationSelectComponent,
  SegmentationSelectOption,
} from './segmentation-select.component';

export const OUTBOUND_SEGMENTATION_SCHEMA_VERSION = 1;

export type SegNumericCompareOp = '>' | '>=' | '<' | '<=';

export interface OutboundSegmentationFormState {
  v: number;
  abandonTime: '24h' | '48h' | '7d';
  avgTicket: string;
  avgTicketOp: SegNumericCompareOp;
  country: string;
  customerState: 'new' | 'recurring';
  advancedOpen: boolean;
  cartProducts: string;
  cartValue: string;
  cartValueOp: SegNumericCompareOp;
  cartItems: string;
  cartItemsOp: SegNumericCompareOp;
  surveyTimeSincePurchase: string;
  surveyTicketValue: string;
  surveyTicketOp: SegNumericCompareOp;
  purchasedProduct: string;
  purchaseFrequency: string;
  paymentDue: string;
  paymentTicketValue: string;
  paymentTicketOp: SegNumericCompareOp;
}

export function defaultOutboundSegmentationForm(): OutboundSegmentationFormState {
  return {
    v: OUTBOUND_SEGMENTATION_SCHEMA_VERSION,
    abandonTime: '24h',
    avgTicket: '',
    avgTicketOp: '>',
    country: 'es',
    customerState: 'new',
    advancedOpen: true,
    cartProducts: 'products',
    cartValue: '',
    cartValueOp: '>',
    cartItems: '',
    cartItemsOp: '>',
    surveyTimeSincePurchase: '3h',
    surveyTicketValue: '',
    surveyTicketOp: '>',
    purchasedProduct: 'products',
    purchaseFrequency: 'first',
    paymentDue: '1h_before',
    paymentTicketValue: '',
    paymentTicketOp: '>',
  };
}

function mergeForm(
  parsed: Partial<OutboundSegmentationFormState>,
): OutboundSegmentationFormState {
  const d = defaultOutboundSegmentationForm();
  return {
    ...d,
    ...parsed,
    v: OUTBOUND_SEGMENTATION_SCHEMA_VERSION,
  };
}

export function parseOutboundSegmentationNotes(
  raw: string | null | undefined,
): OutboundSegmentationFormState {
  const trimmed = (raw ?? '').trim();
  if (!trimmed.startsWith('{')) {
    return defaultOutboundSegmentationForm();
  }
  try {
    const parsed = JSON.parse(trimmed) as Partial<OutboundSegmentationFormState>;
    if (!parsed || typeof parsed !== 'object') {
      return defaultOutboundSegmentationForm();
    }
    return mergeForm(parsed);
  } catch {
    return defaultOutboundSegmentationForm();
  }
}

export function serializeOutboundSegmentationForm(
  form: OutboundSegmentationFormState,
): string {
  return JSON.stringify({
    ...form,
    v: OUTBOUND_SEGMENTATION_SCHEMA_VERSION,
  });
}

@Component({
  selector: 'app-segmentation-step',
  standalone: true,
  imports: [FormsModule, CommonModule, SegmentationSelectComponent],
  templateUrl: './segmentation-step.component.html',
  styleUrls: ['./segmentation-step.component.scss'],
})
export class SegmentationStepComponent implements OnChanges {
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
  get hostOverflowHidden(): boolean {
    return !this.compactEmbed;
  }

  @HostBinding('class.seg-compact-embed')
  get segCompactEmbed(): boolean {
    return this.compactEmbed;
  }

  @Input() segmentationNotes = '';
  /** Coherente con la campaña elegida: solo se muestran reglas avanzadas de ese tipo. */
  @Input() selectedOutboundCampaign: OutboundCampaignKind | null = null;
  /** Sin cabecera/pie del wizard (embebido en editar agente). */
  @Input() compactEmbed = false;
  @Input() currentStepNumber = 0;
  @Input() totalSteps = 0;

  @Output() segmentationNotesChange = new EventEmitter<string>();
  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();

  /** Estado editables del formulario (se sincroniza con `segmentationNotes` vía JSON). */
  form: OutboundSegmentationFormState = defaultOutboundSegmentationForm();

  readonly compareOps: SegNumericCompareOp[] = ['>', '>=', '<', '<='];

  private lastEmitted = '';

  get t() {
    return this.i18nService.getTranslations();
  }

  readonly compactRootClass =
    'w-full flex flex-col min-h-0 flex-1 overflow-visible bg-transparent';

  readonly compactInnerClass =
    'w-full flex min-h-0 flex-col overflow-visible px-0 pb-0';

  readonly compactBodyClass =
    'flex flex-col gap-4 sm:gap-[1.1rem] xl:gap-4 3xl:gap-5 pb-0 max-lg:pb-0 3xl:pb-0';

  readonly rootClass =
    'w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-transparent box-border mx-auto max-w-4xl 3xl:max-w-7xl pt-8 sm:pt-12 3xl:pt-14 4xl:pt-56 items-center justify-start 4xl:items-start 4xl:justify-start';

  readonly innerClass =
    'w-full max-w-[560px] sm:max-w-[640px] md:max-w-[780px] xl:max-w-[740px] 3xl:max-w-[880px] px-5 sm:px-6 md:px-7 xl:px-6 3xl:px-8 flex min-h-0 flex-col overflow-visible pb-6 max-lg:pb-8';

  readonly bodyClass =
    'flex flex-col gap-3 sm:gap-4 xl:gap-3 3xl:gap-4 pb-12 max-lg:pb-28 3xl:pb-14';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['segmentationNotes']) {
      const raw = this.segmentationNotes ?? '';
      if (raw !== this.lastEmitted) {
        this.form = parseOutboundSegmentationNotes(raw);
      }
    }
  }

  toggleAdvanced(): void {
    this.form = { ...this.form, advancedOpen: !this.form.advancedOpen };
    this.persist();
  }

  setAbandonTime(v: OutboundSegmentationFormState['abandonTime']): void {
    this.form = { ...this.form, abandonTime: v };
    this.persist();
  }

  setCustomerState(v: OutboundSegmentationFormState['customerState']): void {
    this.form = { ...this.form, customerState: v };
    this.persist();
  }

  persist(): void {
    const s = serializeOutboundSegmentationForm(this.form);
    this.lastEmitted = s;
    this.segmentationNotesChange.emit(s);
  }

  /** Actualiza un campo de texto/select del formulario y persiste. */
  onSegField(field: keyof OutboundSegmentationFormState, value: string): void {
    this.form = { ...this.form, [field]: value as never };
    this.persist();
  }

  get compareSelectOptions(): SegmentationSelectOption[] {
    return this.compareOps.map((op) => ({ value: op, label: op }));
  }

  get countrySelectOptions(): SegmentationSelectOption[] {
    const tr = this.t;
    return [
      { value: 'es', label: tr.outboundSegCountrySpain },
      { value: 'pt', label: tr.outboundSegCountryPortugal },
      { value: 'fr', label: tr.outboundSegCountryFrance },
      { value: 'mx', label: tr.outboundSegCountryMexico },
    ];
  }

  get cartProductSelectOptions(): SegmentationSelectOption[] {
    return [{ value: 'products', label: this.t.outboundSegSelectProducts }];
  }

  get surveyTimeSelectOptions(): SegmentationSelectOption[] {
    const tr = this.t;
    return [
      { value: '1h', label: tr.outboundSegTime1h },
      { value: '3h', label: tr.outboundSegTime3h },
      { value: '24h', label: tr.outboundSegTime24h },
    ];
  }

  get purchaseFrequencySelectOptions(): SegmentationSelectOption[] {
    const tr = this.t;
    return [
      { value: 'first', label: tr.outboundSegFreqFirstPurchase },
      { value: 'repeat', label: tr.outboundSegFreqRepeat },
    ];
  }

  get paymentDueSelectOptions(): SegmentationSelectOption[] {
    const tr = this.t;
    return [
      { value: '1h_before', label: tr.outboundSegDue1hBefore },
      { value: '24h_before', label: tr.outboundSegDue24hBefore },
      { value: '48h_before', label: tr.outboundSegDue48hBefore },
    ];
  }

  /** Si hay campaña elegida, solo esa sección avanzada; si no (borrador antiguo), las cuatro. */
  isSegmentationSectionVisible(kind: OutboundCampaignKind): boolean {
    if (!this.selectedOutboundCampaign) {
      return true;
    }
    return this.selectedOutboundCampaign === kind;
  }

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }
}
