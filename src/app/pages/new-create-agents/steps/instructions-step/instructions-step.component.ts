import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  HostBinding,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../../../core/services/i18n.service';

export interface OutboundCampaignScripts {
  abandonedCart: string;
  satisfactionSurvey: string;
  postPurchase: string;
  paymentReminder: string;
  /** Lista de teléfonos propia (CSV). */
  customCsv: string;
  /** Automatización vía Make (sin CSV). */
  customMake: string;
}

export type OutboundCampaignKind = keyof OutboundCampaignScripts;

@Component({
  selector: 'app-instructions-step',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './instructions-step.component.html',
  styleUrls: ['./instructions-step.component.scss'],
})
export class InstructionsStepComponent {
  private i18nService = inject(I18nService);

  @HostBinding('class.flex')
  get hostFlex(): boolean {
    return this.outboundInstructionsOnly;
  }
  @HostBinding('class.flex-col')
  get hostFlexCol(): boolean {
    return this.outboundInstructionsOnly;
  }
  @HostBinding('class.min-h-0')
  get hostMinH0(): boolean {
    return this.outboundInstructionsOnly;
  }
  @HostBinding('class.flex-1')
  get hostFlex1(): boolean {
    return this.outboundInstructionsOnly;
  }
  @HostBinding('class.overflow-hidden')
  get hostOverflowHidden(): boolean {
    return this.outboundInstructionsOnly && !this.compactEmbed;
  }
  @HostBinding('class.ins-compact-embed')
  get hostInsCompactEmbed(): boolean {
    return this.compactEmbed && this.outboundInstructionsOnly;
  }

  @Input() greeting = '';
  @Input() instructions = '';
  @Input() showMakeConfig = false;
  @Input() isMakeConfigClosing = false;
  @Input() makeActionData = { name: '', description: '', serverUrl: '' };
  /** Acción Make guardada y activa en la UI (mock). */
  @Input() makeActionActive = false;
  /** Webhook generado tras guardar (mock). */
  @Input() makeGeneratedWebhook = '';
  /** Ingreso real de leads (API): URL del backend. */
  @Input() makeInboundWebhookUrl = '';
  /** Cabecera X-Outbound-Key tras crear/guardar agente. */
  @Input() makeInboundWebhookSecret = '';
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
  /** Saliente: solo instrucciones + generar con IA (sin saludo ni acciones externas). */
  @Input() outboundInstructionsOnly = false;
  /** En modo saliente: ocultar el bloque de instrucciones del sistema (solo plantillas de campaña). */
  @Input() showSystemInstructionsInOutbound = true;
  /** Sin cabecera/pie del wizard (embebido en otras pantallas). */
  @Input() compactEmbed = false;
  @Input() outboundCampaignScripts: OutboundCampaignScripts = {
    abandonedCart: '',
    satisfactionSurvey: '',
    postPurchase: '',
    paymentReminder: '',
    customCsv: '',
    customMake: '',
  };
  /** Saliente: plantillas de guión acotadas al tipo de campaña elegido. */
  @Input() selectedOutboundCampaign: OutboundCampaignKind | null = null;
  /** Tienda Shopify conectada (wizard saliente: bloque embebido como Make). */
  @Input() shopifyConnectedDomain: string | null = null;
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
  @Output() outboundCampaignScriptsChange =
    new EventEmitter<OutboundCampaignScripts>();
  @Output() connectShopifyClicked = new EventEmitter<void>();

  private readonly shopifyStoreCampaignFields: readonly OutboundCampaignKind[] = [
    'satisfactionSurvey',
    'abandonedCart',
    'paymentReminder',
    'postPurchase',
  ];

  /** Mostrar tarjeta «Conectar Shopify» encima de instrucciones (campañas de tienda). */
  get showOutboundShopifyConnect(): boolean {
    if (!this.outboundInstructionsOnly || !this.selectedOutboundCampaign) {
      return false;
    }
    return (this.shopifyStoreCampaignFields as readonly string[]).includes(
      this.selectedOutboundCampaign,
    );
  }

  readonly outboundScriptMeta: {
    field: OutboundCampaignKind;
    tags: readonly string[];
  }[] = [
    {
      field: 'abandonedCart',
      tags: [
        '{{customer_name}}',
        '{{product_name}}',
        '{{cart_total}}',
        '{{store_name}}',
      ],
    },
    {
      field: 'satisfactionSurvey',
      tags: [
        '{{customer_name}}',
        '{{product_name}}',
        '{{cart_total}}',
        '{{store_name}}',
      ],
    },
    {
      field: 'postPurchase',
      tags: [
        '{{customer_name}}',
        '{{product_name}}',
        '{{cart_total}}',
        '{{store_name}}',
        '{{discount_code}}',
        '{{recommended_product}}',
      ],
    },
    {
      field: 'paymentReminder',
      tags: [
        '{{customer_name}}',
        '{{product_name}}',
        '{{cart_total}}',
        '{{store_name}}',
        '{{order_status}}',
        '{{due_date}}',
      ],
    },
    {
      field: 'customCsv',
      tags: [
        '{{customer_name}}',
        '{{company_name}}',
        '{{phone}}',
        '{{reason_for_call}}',
      ],
    },
    {
      field: 'customMake',
      tags: [
        '{{customer_name}}',
        '{{company_name}}',
        '{{event_type}}',
        '{{reason_for_call}}',
      ],
    },
  ];

  /** En saliente, una sola plantilla según campaña; si falta selección (borrador antiguo), se muestran las cuatro. */
  get filteredOutboundScriptMeta(): (typeof this.outboundScriptMeta)[number][] {
    if (
      !this.outboundInstructionsOnly ||
      !this.selectedOutboundCampaign
    ) {
      return this.outboundScriptMeta;
    }
    return this.outboundScriptMeta.filter(
      (m) => m.field === this.selectedOutboundCampaign,
    );
  }

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }

  get t() {
    return this.i18nService.getTranslations();
  }

  get instructionsRootClass(): string {
    if (this.compactEmbed) {
      return 'w-full flex flex-col min-h-0 overflow-visible bg-transparent';
    }
    return this.outboundInstructionsOnly
      ? 'w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-transparent box-border mx-auto max-w-4xl 3xl:max-w-7xl pt-8 sm:pt-12 3xl:pt-14 4xl:pt-56 items-center justify-start'
      : 'w-full h-full bg-transparent flex items-center justify-center 4xl:items-start 4xl:justify-center overflow-visible mx-auto max-w-4xl 3xl:max-w-7xl pt-8 sm:pt-12 3xl:pt-14 4xl:pt-56';
  }

  get instructionsInnerClass(): string {
    const base =
      'w-full max-w-[500px] sm:max-w-[600px] md:max-w-[720px] xl:max-w-[700px] 3xl:max-w-[800px] px-5 sm:px-6 md:px-7 xl:px-6 3xl:px-8';
    if (this.compactEmbed) {
      return 'w-full flex flex-col min-h-0 overflow-visible px-0 pb-0';
    }
    return this.outboundInstructionsOnly
      ? `${base} flex min-h-0 flex-col overflow-visible pb-6 max-lg:pb-8`
      : `${base} flex flex-col overflow-visible`;
  }

  get instructionsBodyWrapperClass(): string {
    const gaps = 'flex flex-col gap-4 xl:gap-3 3xl:gap-5';
    if (this.compactEmbed && this.outboundInstructionsOnly) {
      return `${gaps} pb-0 max-lg:pb-0 3xl:pb-0`;
    }
    return this.outboundInstructionsOnly
      ? `${gaps} pb-12 max-lg:pb-28 3xl:pb-14`
      : `mt-4 xl:mt-3 3xl:mt-4 ${gaps}`;
  }

  outboundScriptTitle(field: OutboundCampaignKind): string {
    const tr = this.t;
    switch (field) {
      case 'abandonedCart':
        return tr.outboundTplAbandonedTitle;
      case 'satisfactionSurvey':
        return tr.outboundTplSatisfactionTitle;
      case 'postPurchase':
        return tr.outboundTplPostPurchaseTitle;
      case 'paymentReminder':
        return tr.outboundTplPaymentTitle;
      case 'customCsv':
        return tr.outboundTplCustomCsvTitle;
      case 'customMake':
        return tr.outboundTplCustomMakeTitle;
      default:
        return '';
    }
  }

  outboundScriptPlaceholder(field: OutboundCampaignKind): string {
    const tr = this.t;
    switch (field) {
      case 'abandonedCart':
        return tr.outboundTplAbandonedPlaceholder;
      case 'satisfactionSurvey':
        return tr.outboundTplSatisfactionPlaceholder;
      case 'postPurchase':
        return tr.outboundTplPostPurchasePlaceholder;
      case 'paymentReminder':
        return tr.outboundTplPaymentPlaceholder;
      case 'customCsv':
        return tr.outboundTplCustomCsvPlaceholder;
      case 'customMake':
        return tr.outboundTplCustomMakePlaceholder;
      default:
        return tr.writeHere;
    }
  }

  onOutboundScriptInput(
    field: OutboundCampaignKind,
    value: string,
  ): void {
    this.outboundCampaignScriptsChange.emit({
      ...this.outboundCampaignScripts,
      [field]: value,
    });
  }

  insertOutboundTag(
    field: OutboundCampaignKind,
    tag: string,
    ta: HTMLTextAreaElement,
  ): void {
    const cur = this.outboundCampaignScripts[field] ?? '';
    const start = typeof ta.selectionStart === 'number' ? ta.selectionStart : cur.length;
    const end = typeof ta.selectionEnd === 'number' ? ta.selectionEnd : cur.length;
    const next = cur.slice(0, start) + tag + cur.slice(end);
    this.outboundCampaignScriptsChange.emit({
      ...this.outboundCampaignScripts,
      [field]: next,
    });
    const pos = start + tag.length;
    queueMicrotask(() => {
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
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

