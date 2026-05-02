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
}

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
    return this.outboundInstructionsOnly;
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
  @Input() outboundCampaignScripts: OutboundCampaignScripts = {
    abandonedCart: '',
    satisfactionSurvey: '',
    postPurchase: '',
    paymentReminder: '',
  };
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

  readonly outboundScriptMeta: {
    field: keyof OutboundCampaignScripts;
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
  ];

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
    return this.outboundInstructionsOnly
      ? 'w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-transparent box-border mx-auto max-w-4xl 3xl:max-w-7xl pt-8 sm:pt-12 3xl:pt-14 4xl:pt-56 items-center justify-start 4xl:items-start 4xl:justify-start'
      : 'w-full h-full bg-transparent flex items-center justify-center 4xl:items-start 4xl:justify-center overflow-visible mx-auto max-w-4xl 3xl:max-w-7xl pt-8 sm:pt-12 3xl:pt-14 4xl:pt-56';
  }

  get instructionsInnerClass(): string {
    const base =
      'w-full max-w-[500px] sm:max-w-[600px] md:max-w-[720px] xl:max-w-[700px] 3xl:max-w-[800px] px-5 sm:px-6 md:px-7 xl:px-6 3xl:px-8';
    return this.outboundInstructionsOnly
      ? `${base} flex min-h-0 flex-col overflow-visible pb-6 max-lg:pb-8`
      : `${base} flex flex-col overflow-visible`;
  }

  get instructionsBodyWrapperClass(): string {
    const gaps = 'flex flex-col gap-4 xl:gap-3 3xl:gap-5';
    return this.outboundInstructionsOnly
      ? `${gaps} pb-12 max-lg:pb-28 3xl:pb-14`
      : `mt-4 xl:mt-3 3xl:mt-4 ${gaps}`;
  }

  outboundScriptTitle(field: keyof OutboundCampaignScripts): string {
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
      default:
        return '';
    }
  }

  outboundScriptPlaceholder(field: keyof OutboundCampaignScripts): string {
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
      default:
        return tr.writeHere;
    }
  }

  onOutboundScriptInput(
    field: keyof OutboundCampaignScripts,
    value: string,
  ): void {
    this.outboundCampaignScriptsChange.emit({
      ...this.outboundCampaignScripts,
      [field]: value,
    });
  }

  insertOutboundTag(
    field: keyof OutboundCampaignScripts,
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

