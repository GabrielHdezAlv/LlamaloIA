import {
  Component,
  HostBinding,
  HostListener,
  OnDestroy,
  AfterViewChecked,
  ElementRef,
  ViewChild,
  OnInit,
  Inject,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '../../shared/modals/modal.service';
import { NotificationService } from '../../core/services/notification.service';
import { I18nService } from '../../core/services/i18n.service';
import {
  AgentsService,
  GenerateAgentInstructionsRequest,
} from '../../core/services/agents.service';
import { KnowledgeBaseService } from '../../core/services/knowledge-base.service';
import { TwilioService } from '../../core/services/twilio.service';
import { getApiErrorMessage } from '../../core/utils/api-error-message';
import { UserService } from '../../core/services/user.service';
import { UserStorage } from '../../storages/user/user-storage';
import { Voice } from '../../shared/models/voice.model';
import {
  SetAgentConfigDto,
  VoiceParameters,
} from '../../shared/models/agent.model';
import lottie from 'lottie-web';
import { getAgentDraftStepLabel } from '../../shared/utils/agent-draft-step-labels';
import { openPlanLimitDialog } from '../../shared/utils/plan-limit-dialog.util';
import { canAddAnotherAgent } from '../../shared/utils/plan-usage.util';
import {
  resolveEffectivePlanSlug,
  isShopifyIntegrationLockedForPlan,
  isOutboundLockedForPlan,
} from '../../shared/utils/shopify-plan-lock.util';
import type { OutboundCampaignScripts } from './steps/instructions-step/instructions-step.component';
import type { OutboundCampaignKind } from './steps/campaign-step/campaign-step.component';

// Clave para localStorage
const AGENT_DRAFT_KEY = 'llamalo_agent_draft';

// Interface para los datos guardados
interface AgentDraft {
  step: string;
  agentName: string;
  greeting: string;
  template: string;
  instructions: string;
  currentVoiceIndex: number;
  selectedVoiceId: string; // voiceId de la voz seleccionada
  selectedCountry: string;
  selectedCountryCode: string;
  selectedCallType?: 'inbound' | 'outbound' | null;
  phoneNumber: string;
  inactivityTimeout: number;
  maxCallDuration: number;
  agentSpeed: number;
  llmTemperature: number;
  isRecordingNoticeEnabled: boolean;
  recordingNoticeText: string;
  voiceParameters?: {
    stability: number;
    similarity: number;
    style: number;
    boost: boolean;
    speed: number;
  };
  shopifyDomain?: string | null; // Tienda Shopify conectada (ej. "mi-tienda.myshopify.com")
  /** Textos de plantillas saliente (carrito, encuesta, etc.). */
  outboundCampaignScripts?: Partial<OutboundCampaignScripts>;
  /** Tipo de campaña elegido en el paso «Campaña» (solo saliente). */
  outboundCampaignKind?: OutboundCampaignKind | null;
  /** Notas de segmentación (paso posterior a importar CSV, solo saliente). */
  outboundSegmentationNotes?: string;
  /** Números importados desde CSV (entre instrucciones y segmentación, solo saliente). */
  outboundImportCsvPhones?: string[];
  /** Programar campaña (JSON, tras segmentación). */
  outboundScheduleCampaignNotes?: string;
  savedAt: number; // timestamp
}

const DEFAULT_OUTBOUND_CAMPAIGN_SCRIPTS: OutboundCampaignScripts = {
  abandonedCart: '',
  satisfactionSurvey: '',
  postPurchase: '',
  paymentReminder: '',
};

import { KnowledgeBaseStepComponent } from './steps/knowledge-base-step/knowledge-base-step.component';
import { AgentNameStepComponent } from './steps/agent-name-step/agent-name-step.component';
import { CallTypeStepComponent } from './steps/call-type-step/call-type-step.component';
import { VoicesStepComponent } from './steps/voices-step/voices-step.component';
import { ConnectBusinessStepComponent } from './steps/connect-business-step/connect-business-step.component';
import { InstructionsStepComponent } from './steps/instructions-step/instructions-step.component';
import { TestAgentStepComponent } from './steps/test-agent-step/test-agent-step.component';
import { ConnectPhoneStepComponent } from './steps/connect-phone-step/connect-phone-step.component';
import { SuccessStepComponent } from './steps/success-step/success-step.component';
import { CampaignStepComponent } from './steps/campaign-step/campaign-step.component';
import { SegmentationStepComponent } from './steps/segmentation-step/segmentation-step.component';
import { ScheduleCampaignStepComponent } from './steps/schedule-campaign-step/schedule-campaign-step.component';
import { ImportCsvStepComponent } from './steps/import-csv-step/import-csv-step.component';

@Component({
  selector: 'app-new-create-agents',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    KnowledgeBaseStepComponent,
    AgentNameStepComponent,
    CallTypeStepComponent,
    VoicesStepComponent,
    ConnectBusinessStepComponent,
    InstructionsStepComponent,
    TestAgentStepComponent,
    ConnectPhoneStepComponent,
    SuccessStepComponent,
    CampaignStepComponent,
    SegmentationStepComponent,
    ScheduleCampaignStepComponent,
    ImportCsvStepComponent,
  ],
  templateUrl: './new-create-agents.component.html',
  styleUrl: './new-create-agents.component.scss',
})
export class NewCreateAgentsComponent
  implements OnDestroy, AfterViewChecked, OnInit
{
  @HostBinding('class.outbound-instructions-viewport')
  get outboundInstructionsViewport(): boolean {
    return (
      this.isOutboundAgentFlow &&
      (this.displayedStep === 'campaign' ||
        this.displayedStep === 'instructions' ||
        this.displayedStep === 'importCsv' ||
        this.displayedStep === 'segmentation' ||
        this.displayedStep === 'scheduleCampaign')
    );
  }

  @ViewChild('lottieContainer', { static: false })
  lottieContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('countryDropdown', { static: false })
  countryDropdown!: ElementRef<HTMLDivElement>;

  step:
    | 'agentName'
    | 'language'
    | 'voices'
    | 'campaign'
    | 'importCsv'
    | 'segmentation'
    | 'scheduleCampaign'
    | 'connectBusiness'
    | 'instructions'
    | 'knowledgeBase'
    | 'summary'
    | 'connectPhone'
    | 'advancedSettings'
    | 'final'
    | 'success' = 'agentName';

  displayedStep:
    | 'agentName'
    | 'language'
    | 'voices'
    | 'campaign'
    | 'importCsv'
    | 'segmentation'
    | 'scheduleCampaign'
    | 'connectBusiness'
    | 'instructions'
    | 'knowledgeBase'
    | 'summary'
    | 'connectPhone'
    | 'advancedSettings'
    | 'final'
    | 'success' = 'agentName';

  isStepFadingOut = false;

  // Popup de recuperación de borrador
  showRecoveryPopup = false;
  savedDraft: AgentDraft | null = null;

  /** Campaña saliente elegida (tras instrucciones). */
  selectedOutboundCampaign: OutboundCampaignKind | null = null;
  /** Texto libre de segmentación (tras importar CSV). */
  outboundSegmentationNotes = '';
  /** Teléfonos desde CSV (antes de segmentación). */
  outboundImportCsvPhones: string[] = [];
  /** Programar campaña (JSON). */
  outboundScheduleCampaignNotes = '';

  // Add this line to declare phoneNumber
  phoneNumber = '';
  selectedCallType: 'inbound' | 'outbound' | null = null;
  label: string = ''; // Etiqueta del agente
  selectedVoiceId: string = ''; // voiceId de la voz seleccionada
  showTwilioConfig = false;
  showMakeConfig = false;
  isMakeConfigClosing = false;
  makeActionData = {
    name: '',
    description: '',
    serverUrl: '',
  };

  /** Acción Make guardada (mock): muestra webhook y estado “activa”. */
  makeActionActive = false;
  /** Webhook generado al guardar (mock). */
  makeGeneratedWebhook = '';

  /** Dominio de Shopify conectado en este flujo (para mostrar tick + "Conectado" en lugar del botón Conectar) */
  shopifyConnectedDomain: string | null = null;

  /** IDs de las fuentes de conocimiento seleccionadas por el usuario */
  selectedKnowledgeSourceIds: string[] = [];

  // Variables para Twilio
  twilioSid = '';
  twilioToken = '';
  isValidatingTwilio = false;
  twilioValidationStatus: 'success' | 'error' | null = null;
  twilioErrorMessage = '';
  isTwilioValidated = false;
  twilioSidValidationStatus: 'success' | 'error' | null = null;
  twilioTokenValidationStatus: 'success' | 'error' | null = null;

  // Variables para cuentas de Twilio existentes
  twilioAccounts: Array<{
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  }> = [];
  selectedTwilioAccount: {
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  } | null = null;
  showNewTwilioAccountForm = false;
  loadingTwilioAccounts = false;

  // Variables para números de teléfono disponibles
  availablePhoneNumbers: Array<{
    phoneId: number;
    countryCode: string;
    number: string;
    state?: 'Activo' | 'Inactivo';
    importedBy?: string;
    twilioAccountId?: number;
  }> = [];
  loadingPhoneNumbers = false;

  // Variables para validación automática del teléfono
  isValidatingPhone = false;
  phoneValidationStatus: 'success' | 'error' | null = null;
  phoneErrorMessage = '';
  private phoneValidationTimeout: any = null;

  private lottieInstance: any = null;
  private lottieInitialized = false;
  private isBrowser: boolean = false;

  // Estado del sidebar
  isSidebarOpen: boolean = false;

  private agentsService = inject(AgentsService);
  private knowledgeBaseService = inject(KnowledgeBaseService);
  private twilioService = inject(TwilioService);
  private userService = inject(UserService);
  private userStore = inject(UserStorage);
  private voicesLoaded = false;
  private route = inject(ActivatedRoute, { optional: true });
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private stepFadeTimeout: any = null;

  constructor(
    private location: Location,
    private modalService: ModalService,
    private i18nService: I18nService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    // Bloquear scroll del body cuando el componente se inicializa
    if (this.isBrowser && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  /** Gratis / Starter: no se muestra el paso de conectar Shopify (API: desde Growth). */
  get skipShopifyBusinessStep(): boolean {
    const slug = resolveEffectivePlanSlug(this.userStore.user());
    return isShopifyIntegrationLockedForPlan(slug);
  }

  /** Outbound solo Growth / Scale (mismo criterio que Shopify). */
  get outboundLocked(): boolean {
    const slug = resolveEffectivePlanSlug(this.userStore.user());
    return isOutboundLockedForPlan(slug);
  }

  /** Si el plan no incluye outbound, limpia selección y pasos solo salientes. */
  private enforceOutboundPlanGate(): void {
    if (!this.outboundLocked) return;
    if (this.selectedCallType === 'outbound') {
      this.selectedCallType = null;
    }
    const outboundOnly: Array<typeof this.step> = [
      'campaign',
      'importCsv',
      'segmentation',
      'scheduleCampaign',
    ];
    if (outboundOnly.includes(this.step)) {
      this.step = 'language';
      this.displayedStep = 'language';
      this.isStepFadingOut = false;
    }
  }

  /** Creación de agente saliente: mismo aspecto en pasos compartidos; pipeline y datos distintos al entrante. */
  get isOutboundAgentFlow(): boolean {
    return this.selectedCallType === 'outbound';
  }

  private redirectConnectBusinessIfShopifyLocked(): void {
    if (!this.skipShopifyBusinessStep) return;
    if (this.step !== 'connectBusiness' && this.displayedStep !== 'connectBusiness') {
      return;
    }
    if (this.isOutboundAgentFlow) {
      this.setStep('voices');
      return;
    }
    this.setStep('instructions');
  }

  ngOnInit() {
    const stepParam = this.route?.snapshot?.queryParams?.['step'];
    this.checkForSavedDraft();

    if (stepParam === 'connectBusiness') {
      if (this.savedDraft) {
        this.recoverDraft();
      }
      this.step = 'connectBusiness';
      this.displayedStep = 'connectBusiness';
      this.isStepFadingOut = false;
      this.showRecoveryPopup = false;
      this.saveDraft();
    } else if (this.savedDraft && this.showRecoveryPopup) {
      this.recoverDraft();
    }

    if (this.isBrowser) {
      this.animateIdle();
      this.handleShopifyReturnParams();
      document.body.classList.add('creating-agent');
    }

    this.redirectConnectBusinessIfShopifyLocked();
    void this.userStore.loadUserProfile().finally(() => {
      this.redirectConnectBusinessIfShopifyLocked();
      this.enforceOutboundPlanGate();
    });
  }

  /**
   * Lee query params de retorno de Shopify (shopify=success|error, shop, code, message)
   * y muestra mensaje de éxito o error; luego limpia la URL para que al recargar no se repita.
   */
  private handleShopifyReturnParams(): void {
    const params = this.route?.snapshot?.queryParams;
    if (!params || params['shopify'] === undefined) return;

    const shopify = params['shopify'];
    const shop = params['shop'] ?? '';
    const code = params['code'] ?? '';
    const message = params['message'] ?? '';

    const cleanUrl = (): void => {
      const step = this.skipShopifyBusinessStep ? 'instructions' : 'connectBusiness';
      this.router.navigate(['/dashboard/agents/create'], {
        replaceUrl: true,
        queryParams: { step },
        queryParamsHandling: '',
      });
    };

    if (shopify === 'success' && shop) {
      this.shopifyConnectedDomain = shop;
      this.saveDraft();
      cleanUrl();
      return;
    }

    if (shopify === 'error') {
      const errorTitle =
        code === '401'
          ? 'No autorizado'
          : code === '400'
            ? 'Solicitud incorrecta'
            : 'Error al conectar con Shopify';
      const errorMessage =
        message ||
        (code === '401'
          ? 'La sesión ha expirado o no tienes permiso. Vuelve a iniciar sesión.'
          : code === '400'
            ? 'Los datos enviados no son válidos. Comprueba el dominio e inténtalo de nuevo.'
            : 'No se pudo completar la conexión. Inténtalo de nuevo.');
      this.notificationService.error(errorMessage);
      cleanUrl();
    }
  }

  // Verificar si hay datos guardados
  private checkForSavedDraft() {
    if (!this.isBrowser) return;

    try {
      const savedData = localStorage.getItem(AGENT_DRAFT_KEY);

      if (savedData) {
        this.savedDraft = JSON.parse(savedData);

        if (this.savedDraft?.step === 'success') {
          localStorage.removeItem(AGENT_DRAFT_KEY);
          this.savedDraft = null;
          return;
        }

        // Verificar que el borrador tenga datos significativos
        if (this.savedDraft) {
          // Mostrar popup si está más allá del primer paso O si tiene nombre de agente
          if (
            this.savedDraft.step !== 'agentName' ||
            (this.savedDraft.agentName &&
              this.savedDraft.agentName.trim() !== '')
          ) {
            this.showRecoveryPopup = true;
          }
        }
      }
    } catch (e) {
      console.error('Error al parsear borrador guardado:', e);
      localStorage.removeItem(AGENT_DRAFT_KEY);
    }
  }

  // Recuperar el borrador guardado (paso actual y todo lo escrito)
  recoverDraft() {
    if (this.savedDraft) {
      this.agentName = this.savedDraft.agentName || '';
      this.greeting = this.getGreetingWithCompanyName();
      this.template = this.savedDraft.template || '';
      this.selectedCallType = (this.savedDraft as any).selectedCallType ?? null;
      let recoveredStep = (this.savedDraft.step || 'agentName') as string;
      if (recoveredStep === 'outboundPostShopify') {
        recoveredStep = 'instructions';
      }
      this.step = recoveredStep as any;
      this.instructions = this.savedDraft.instructions || '';
      this.outboundCampaignScripts = {
        ...DEFAULT_OUTBOUND_CAMPAIGN_SCRIPTS,
        ...(this.savedDraft.outboundCampaignScripts || {}),
      };
      const rawKind = this.savedDraft.outboundCampaignKind;
      this.selectedOutboundCampaign =
        rawKind === 'satisfactionSurvey' ||
        rawKind === 'abandonedCart' ||
        rawKind === 'paymentReminder' ||
        rawKind === 'postPurchase'
          ? rawKind
          : null;
      this.outboundSegmentationNotes =
        this.savedDraft.outboundSegmentationNotes ?? '';
      const rawPhones = this.savedDraft.outboundImportCsvPhones;
      this.outboundImportCsvPhones = Array.isArray(rawPhones)
        ? rawPhones.filter((x): x is string => typeof x === 'string')
        : [];
      this.outboundScheduleCampaignNotes =
        this.savedDraft.outboundScheduleCampaignNotes ?? '';
      this.currentVoiceIndex = this.savedDraft.currentVoiceIndex ?? 0;
      this.selectedVoiceId = this.savedDraft.selectedVoiceId || '';
      this.selectedCountry = this.savedDraft.selectedCountry || 'es';
      this.selectedCountryCode = this.savedDraft.selectedCountryCode || '+34';
      this.phoneNumber = this.savedDraft.phoneNumber || '';
      this.inactivityTimeout = this.savedDraft.inactivityTimeout ?? 0;
      this.maxCallDuration = this.savedDraft.maxCallDuration ?? 0;
      this.agentSpeed = this.savedDraft.agentSpeed ?? 0;
      this.llmTemperature = this.savedDraft.llmTemperature ?? 0;
      this.isRecordingNoticeEnabled =
        this.savedDraft.isRecordingNoticeEnabled ?? false;
      this.recordingNoticeText =
        this.savedDraft.recordingNoticeText ||
        'Le informamos que esta llamada será grabada con fines de calidad y seguridad. Puede consultar más información sobre el tratamiento de sus datos en nuestra política de privacidad.';

      if (this.savedDraft.voiceParameters) {
        this.voiceParameters = {
          ...this.voiceParameters,
          ...this.savedDraft.voiceParameters,
        };
      }

      this.shopifyConnectedDomain = this.savedDraft.shopifyDomain ?? null;

      // Actualizar bandera de idioma cuando la vista esté lista
      setTimeout(() => this.updateFlag(this.selectedCountry), 0);

      if (this.step === 'voices') {
        this.loadVoices();
      }

      if (this.step === 'summary') {
        this.animateIdle();
      }

      if (this.step === 'summary') {
        setTimeout(() => this.logSavedData(), 100);
      }

      if (this.step === 'connectPhone') {
        this.showTwilioConfig = false;
      }

      if (this.skipShopifyBusinessStep && this.step === 'connectBusiness') {
        this.step =
          this.selectedCallType === 'outbound' ? 'voices' : 'instructions';
      }
      if (this.userStore.user()) {
        this.enforceOutboundPlanGate();
      }
    }
    this.showRecoveryPopup = false;
    this.displayedStep = this.step;
    this.isStepFadingOut = false;
  }

  // Descartar el borrador y empezar de nuevo
  discardDraft() {
    this.clearSavedDraft();
    this.showRecoveryPopup = false;
  }

  // Guardar el estado actual en localStorage
  saveDraft() {
    if (!this.isBrowser) return;
    // Tras crear el agente con éxito no debe persistir borrador (ngOnDestroy/beforeunload lo volvían a guardar)
    if (this.step === 'success') return;

    try {
      const draft: AgentDraft = {
        step: this.step,
        agentName: this.agentName,
        greeting: this.greeting,
        template: this.template,
        instructions: this.instructions,
        currentVoiceIndex: this.currentVoiceIndex,
        selectedVoiceId: this.selectedVoiceId,
        selectedCallType: this.selectedCallType,
        selectedCountry: this.selectedCountry,
        selectedCountryCode: this.selectedCountryCode,
        phoneNumber: this.phoneNumber,
        inactivityTimeout: this.inactivityTimeout,
        maxCallDuration: this.maxCallDuration,
        agentSpeed: this.agentSpeed,
        llmTemperature: this.llmTemperature,
        isRecordingNoticeEnabled: this.isRecordingNoticeEnabled,
        recordingNoticeText: this.recordingNoticeText,
        voiceParameters: {
          stability: this.voiceParameters.stability,
          similarity: this.voiceParameters.similarity,
          style: this.voiceParameters.style,
          boost: this.voiceParameters.boost,
          speed: this.voiceParameters.speed,
        },
        shopifyDomain: this.shopifyConnectedDomain ?? undefined,
        outboundCampaignScripts: { ...this.outboundCampaignScripts },
        outboundCampaignKind: this.selectedOutboundCampaign ?? undefined,
        outboundImportCsvPhones: [...this.outboundImportCsvPhones],
        outboundSegmentationNotes: this.outboundSegmentationNotes,
        outboundScheduleCampaignNotes: this.outboundScheduleCampaignNotes,
        savedAt: Date.now(),
      };

      localStorage.setItem(AGENT_DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.error('Error al guardar borrador:', e);
    }
  }

  // Limpiar el borrador guardado
  clearSavedDraft() {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(AGENT_DRAFT_KEY);
    } catch (e) {
      console.error('Error al eliminar borrador:', e);
    }
  }

  // Obtener texto del paso guardado para mostrar en el popup
  getSavedStepText(): string {
    if (!this.savedDraft) return '';
    return getAgentDraftStepLabel(
      this.savedDraft.step,
      this.i18nService.selectedLanguage().code,
    );
  }

  greeting = this.getGreetingWithCompanyName();
  template = '';
  instructions = '';
  /** Plantillas de mensaje bajo instrucciones (solo flujo saliente). */
  outboundCampaignScripts: OutboundCampaignScripts = {
    ...DEFAULT_OUTBOUND_CAMPAIGN_SCRIPTS,
  };
  showExpandInstructionsModal = false;
  isInstructionsModalClosing = false;

  openExpandInstructionsModal() {
    this.showExpandInstructionsModal = true;
    this.isInstructionsModalClosing = false;
  }

  closeExpandInstructionsModal() {
    this.isInstructionsModalClosing = true;
    setTimeout(() => {
      this.showExpandInstructionsModal = false;
      this.isInstructionsModalClosing = false;
    }, 150); // Duración de la animación de salida
  }

  getGreetingWithCompanyName(): string {
    const companyName = this.userStore.user()?.enterprise?.name;

    // Verificar si el nombre de empresa existe, no es null/undefined, no está vacío y no son solo espacios
    if (companyName && companyName.trim() !== '') {
      return `Hola, gracias por llamar a ${companyName.trim()}. ¿En qué puedo ayudarte?`;
    } else {
      return 'Hola, gracias por llamar. ¿En qué puedo ayudarte?';
    }
  }
  agentName: string = '';

  // Modal de generar prompt con IA
  showGeneratePromptModal = false;
  promptDescription = '';
  promptEnterpriseName = '';
  isGeneratingPrompt = false;
  generatePromptError = '';
  isGeneratePromptDropdownClosing = false;

  audioActual: HTMLAudioElement | null = null;
  isPlaying: boolean = false;
  currentPlayingVoice: string | null = null;

  // Variables para el micrófono
  isMicrophoneActive: boolean = false;
  audioLevel: number = 0;
  audioContext: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  microphone: MediaStreamAudioSourceNode | null = null;
  animationFrame: number | null = null;

  // Variables para el video del mar
  videoSrc: string = 'assets/bucle2.mp4'; // Ruta del video del mar (opcional)

  // Variables para el carrusel de voces
  currentVoiceIndex: number = 0;
  tabletPageIndex = 0;
  private tabletTouchStartX: number | null = null;
  private tabletTouchDeltaX = 0;
  private readonly tabletSwipeThreshold = 60;
  // Array vacío inicial - se llenará con datos del backend
  voices: any[] = [];

  // Propiedades para dropdowns de país y voz
  showCountryDropdown = false;
  showVoiceDropdown = false;
  showVoiceParamsDropdown = false;
  countryOptions = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'it', label: 'Italiano' },
    { code: 'de', label: 'Deutsch' },
    { code: 'pt', label: 'Português' },
    { code: 'us', label: 'English (US)' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'se', label: 'Svenska' },
    { code: 'nl', label: 'Nederlands' },
  ];

  // Datos mockeados de referencia para imágenes, descripciones y badges
  private readonly defaultVoicesData = [
    {
      name: 'Carla',
      image: 'assets/carla_prueba1.webp',
      description:
        'Diseñadora de Producto enfocada en simplicidad y usabilidad.',
      badgeText: 'Top 1% Voz',
    },
    {
      name: 'Carlos',
      image: 'assets/carlos_prueba1.webp',
      description:
        'Especialista en Soporte Técnico con tono calmado y resolutivo.',
      badgeText: 'Top 5% Voz',
    },
    {
      name: 'David',
      image: 'assets/david_prueba1.webp',
      description: 'Ejecutivo de Ventas con energía y capacidad de persuasión.',
      badgeText: 'Top Ventas',
    },
    {
      name: 'Jesús',
      image: 'assets/jesus_prueba1.webp',
      description:
        'Asistente Virtual amigable ideal para recepción de llamadas.',
      badgeText: 'Popular',
    },
    {
      name: 'Claudia',
      image: 'assets/claudia_prueba1.webp',
      description: 'Narradora profesional perfecta para contenido educativo.',
      badgeText: 'Nueva',
    },
    {
      name: 'María',
      image: 'assets/maria_prueba1.webp',
      description:
        'Agente de atención al cliente con gran empatía y paciencia.',
      badgeText: 'Destacada',
    },
  ];

  // Método para cargar las voces del backend
  private loadVoices() {
    // Solo cargar si no se han cargado antes
    if (this.voicesLoaded) {
      return;
    }

    this.agentsService.getVoices().subscribe({
      next: (backendVoices: Voice[]) => {
        // Construir objetos combinando datos del backend con datos mockeados
        const mappedVoices = backendVoices.map((voice: Voice) => {
          // Buscar si existe una voz con el mismo nombre en los datos mockeados para mantener imagen, descripción y badge
          const defaultVoice = this.defaultVoicesData.find(
            (v) => v.name.toLowerCase() === voice.name.toLowerCase(),
          );

          return {
            id: voice.voiceId, // Usar voiceId del backend como id
            voiceId: voice.voiceId, // Agregar el voiceId del backend
            name: voice.name, // Usar nombre del backend
            image: defaultVoice?.image || '', // Mantener imagen mockeada si existe
            isCustom: false,
            description: defaultVoice?.description || `Voz ${voice.name}`, // Mantener descripción mockeada si existe
            badgeText: defaultVoice?.badgeText || '', // Mantener badge mockeado si existe
          };
        });

        // Asignar las voces construidas con datos del backend
        this.voices = mappedVoices;

        this.voicesLoaded = true;
      },
      error: (error) => {
        console.error('Error al cargar las voces:', error);
        // Dejar el array vacío en caso de error
        this.voices = [];
      },
    });
  }

  // Métodos para dropdowns de país y voz
  toggleCountryDropdown(event: Event) {
    event.stopPropagation();
    this.showVoiceDropdown = false;
    this.showVoiceParamsDropdown = false;
    this.showCountryDropdown = !this.showCountryDropdown;
  }

  toggleVoiceDropdown(event: Event) {
    event.stopPropagation();
    this.showCountryDropdown = false;
    this.showVoiceParamsDropdown = false;
    this.showVoiceDropdown = !this.showVoiceDropdown;
  }

  toggleVoiceParamsDropdown(event: Event) {
    event.stopPropagation();
    this.showVoiceDropdown = false;
    this.showVoiceParamsDropdown = !this.showVoiceParamsDropdown;
  }

  getSelectedCountryOption() {
    return (
      this.countryOptions.find((c) => c.code === this.selectedCountry) ||
      this.countryOptions[0]
    );
  }

  getSelectedVoice() {
    if (!this.selectedVoiceId) return null;
    return this.voices.find((v) => v.voiceId === this.selectedVoiceId);
  }

  selectVoice(voiceId: string) {
    this.pauseVoice();
    this.selectedVoiceId = voiceId;
    this.showVoiceDropdown = false;
    this.loadVoices();

    // Set default parameters based on the selected voice
    const voice = this.voices.find(v => v.voiceId === voiceId);
    if (voice) {
      if (voice.name.includes('Carlos')) {
        this.voiceParameters = { stability: 0.85, similarity: 0.85, style: 0.85, speed: 1.05, boost: true };
      } else if (voice.name.includes('María') || voice.name.includes('Maria')) {
        this.voiceParameters = { stability: 0.45, similarity: 0.85, style: 0.40, speed: 1.05, boost: true };
      } else if (voice.name.includes('Carla')) {
        this.voiceParameters = { stability: 1.0, similarity: 0.70, style: 0.40, speed: 1.15, boost: false };
      } else if (voice.name.includes('David')) {
        this.voiceParameters = { stability: 0.70, similarity: 0.70, style: 0.70, speed: 1.15, boost: true };
      } else if (voice.name.includes('Jesús') || voice.name.includes('Jesus')) {
        this.voiceParameters = { stability: 1.0, similarity: 0.70, style: 0.30, speed: 1.15, boost: false };
      } else if (voice.name.includes('Claudia')) {
        this.voiceParameters = { stability: 1.0, similarity: 0.80, style: 0.20, speed: 1.15, boost: true };
      } else {
        // Fallback default
        this.voiceParameters = { stability: 0.5, similarity: 0.8, style: 0.5, speed: 0.98, boost: true };
      }
    }
  }

  playVoicePreview(voice: { name: string; voiceId: string }, event: Event) {
    event.stopPropagation();
    if (this.currentPlayingVoice === voice.voiceId) {
      this.pauseVoice();
    } else {
      this.playVoice(voice);
    }
  }

  onSelectCallType(type: 'inbound' | 'outbound') {
    // Si ya está seleccionado, deseleccionar; si no, seleccionar
    this.selectedCallType = this.selectedCallType === type ? null : type;
  }

  private pendingLanguageSelection: string | null = null;

  // Método helper para verificar si un idioma está seleccionado
  isLanguageSelected(languageCode: string): boolean {
    return (
      this.selectedCountry === languageCode &&
      this.pendingLanguageSelection === languageCode
    );
  }

  // Método helper para verificar si hay un idioma pendiente de confirmación
  hasPendingLanguageSelection(): boolean {
    return this.pendingLanguageSelection !== null;
  }

  // Método para limpiar la selección pendiente
  clearPendingLanguageSelection() {
    this.pendingLanguageSelection = null;
  }

  // Método para manejar clics fuera de las banderas (a nivel de documento)
  // Este método se combina con onDocumentClick más abajo
  private handleLanguageSelectionClick(event: MouseEvent) {
    // Solo procesar si estamos en el step de idioma y hay una selección pendiente
    if (this.step !== 'language' || !this.pendingLanguageSelection) {
      return;
    }

    const target = event.target as HTMLElement;
    if (!target) return;

    // Verificar si el clic fue en un botón de idioma o dentro de él
    // Los botones de idioma están dentro del grid y tienen la clase "group"
    const isLanguageButton =
      target.closest('button.group') ||
      target.closest('button[class*="flex flex-col"]');
    // Si no fue en un botón de idioma, limpiar la selección pendiente
    if (!isLanguageButton) {
      this.clearPendingLanguageSelection();
    }
  }

  onLanguageSelected(
    languageCode: string = 'es',
    countryCode: string = '+34',
    event?: Event,
  ) {
    // Prevenir la propagación del evento para evitar que se limpie la selección
    if (event) {
      event.stopPropagation();
    }
    // Si el idioma clickeado ya está seleccionado y hay una selección pendiente, es el segundo click
    if (
      this.pendingLanguageSelection &&
      this.selectedCountry === languageCode &&
      this.pendingLanguageSelection === languageCode
    ) {
      // Segundo click en el mismo idioma: avanzar al siguiente paso
      this.pendingLanguageSelection = null;
      this.step = 'voices';
      this.loadVoices();
      this.saveDraft();
      return;
    }

    // Si es un idioma diferente al seleccionado, reiniciar la selección pendiente
    if (this.selectedCountry !== languageCode) {
      this.pendingLanguageSelection = null;
      this.pauseVoice(); // Detener audio cuando cambia de idioma
    }

    // Primer click: seleccionar idioma pero no avanzar
    this.selectedCountry = languageCode;
    this.selectedCountryCode = countryCode;
    this.pendingLanguageSelection = languageCode;
    this.updateFlag(languageCode);
    // No avanzar al siguiente paso, esperar el segundo click
  }

  onVoiceSelected(voice?: any) {
    // Si se pasa la voz como parámetro, guardar el voiceId
    if (voice) {
      this.selectedVoiceId = (voice as any)?.voiceId || voice?.id || '';
      // Actualizar el índice también para mantener consistencia
      const voiceIndex = this.voices.findIndex(
        (v) =>
          (v as any)?.voiceId === this.selectedVoiceId ||
          v.id === this.selectedVoiceId,
      );
      if (voiceIndex !== -1) {
        this.currentVoiceIndex = voiceIndex;
      }
    } else {
      // Si no se pasa parámetro, usar la voz actual según el índice
      const currentVoice = this.getCurrentVoice();
      if (currentVoice) {
        this.selectedVoiceId =
          (currentVoice as any)?.voiceId || currentVoice.id || '';
      }
    }
    this.isSidebarOpen = true;
  }

  confirmVoiceSelection() {
    // Asegurar que el voiceId esté guardado antes de continuar
    if (!this.selectedVoiceId) {
      const currentVoice = this.getCurrentVoice();
      if (currentVoice) {
        this.selectedVoiceId =
          (currentVoice as any)?.voiceId || currentVoice.id || '';
      }
    }
    this.pauseVoice();
    this.isSidebarOpen = false;
    if (!this.tryAdvanceFromVoicesStepAfterLanguageAndVoice()) {
      return;
    }
  }

  /**
   * Tras idioma y voz: entrante sigue el flujo habitual.
   * Saliente: mismo paso Shopify que entrante si el plan lo permite (Growth+, no Starter/gratis);
   * si Shopify está bloqueado por plan, aún no hay siguientes pasos en esta rama.
   */
  private tryAdvanceFromVoicesStepAfterLanguageAndVoice(): boolean {
    if (this.selectedCallType === 'outbound') {
      if (this.skipShopifyBusinessStep) {
        this.saveDraft();
        this.notificationService.info(
          'Los siguientes pasos para agentes salientes estarán disponibles pronto.',
        );
        return false;
      }
      this.setStep('connectBusiness');
      this.saveDraft();
      return true;
    }
    this.setStep(this.skipShopifyBusinessStep ? 'instructions' : 'connectBusiness');
    this.saveDraft();
    return true;
  }

  closeSidebar() {
    if (this.step === 'voices') {
      this.pauseVoice();
    }
    this.isSidebarOpen = false;
  }

  // Métodos para el carrusel de voces
  nextVoice() {
    const visibleCount = this.getVisibleCount();
    const maxPageIndex = Math.max(
      Math.ceil(this.voices.length / visibleCount) - 1,
      0,
    );
    const currentPage = Math.floor(this.currentVoiceIndex / visibleCount);

    if (currentPage < maxPageIndex) {
      // Avanzar a la siguiente página (3 voces)
      this.currentVoiceIndex = Math.min(
        (currentPage + 1) * visibleCount,
        this.voices.length - 1,
      );
    }
  }

  previousVoice() {
    const visibleCount = this.getVisibleCount();
    const currentPage = Math.floor(this.currentVoiceIndex / visibleCount);

    if (currentPage > 0) {
      // Retroceder a la página anterior (3 voces)
      this.currentVoiceIndex = (currentPage - 1) * visibleCount;
    }
  }

  // Obtener las voces de la página actual para desktop
  getDesktopPageVoices() {
    const visibleCount = this.getVisibleCount();
    const currentPage = Math.floor(this.currentVoiceIndex / visibleCount);
    const start = currentPage * visibleCount;
    return this.voices.slice(start, start + visibleCount);
  }

  getCurrentVoice() {
    return this.voices[this.currentVoiceIndex];
  }

  // Métodos para verificar el estado de los botones
  isPreviousDisabled(): boolean {
    return this.currentVoiceIndex === 0;
  }

  isNextDisabled(): boolean {
    const visibleCount = this.getVisibleCount();
    const maxPageIndex = Math.max(
      Math.ceil(this.voices.length / visibleCount) - 1,
      0,
    );
    const currentPage = Math.floor(this.currentVoiceIndex / visibleCount);
    return currentPage >= maxPageIndex;
  }

  shouldHideCarousel(): boolean {
    return this.voices.length <= this.getVisibleCount();
  }

  getMaxIndicatorIndex(): number {
    const visibleCount = this.getVisibleCount();
    return Math.max(this.voices.length - visibleCount, 0);
  }

  getCarouselTransform(): string {
    // Sin deslizamiento - las cartas se muestran directamente
    return 'translateX(0)';
  }

  getSlideWidthPercent(): string {
    const visibleCount = this.getVisibleCount();
    const gap = this.getSlideGapPx();
    const viewportWidth = this.getViewportWidth();

    // Reducir ancho de cartas un 10% en desktop (lg:)
    const scaleFactor = viewportWidth >= 1280 ? 0.9 : 1;

    if (gap === 0) {
      return `${(100 / visibleCount) * scaleFactor}%`;
    }
    const totalGap = gap * (visibleCount - 1);

    if (viewportWidth >= 1280) {
      // En desktop, aplicar factor de escala
      return `calc(((100% - ${totalGap}px) / ${visibleCount}) * ${scaleFactor})`;
    }
    return `calc((100% - ${totalGap}px) / ${visibleCount})`;
  }

  getSlideFlexValue(): string {
    return `0 0 ${this.getSlideWidthPercent()}`;
  }

  @HostListener('window:resize')
  handleResize() {
    const visibleCount = this.getVisibleCount();
    const maxIndex = Math.max(this.voices.length - visibleCount, 0);
    if (this.currentVoiceIndex > maxIndex) {
      this.currentVoiceIndex = maxIndex;
    }
    this.tabletPageIndex = Math.min(
      this.tabletPageIndex,
      this.getTabletTotalPages() - 1,
    );
  }

  getVisibleCount(): number {
    const width = this.getViewportWidth();
    if (width < 1280) {
      // Tablets y viewports medianos muestran 2 cartas
      return 2;
    }
    return 3;
  }

  getSlideGapPx(): number {
    const width = this.getViewportWidth();

    if (width >= 1280) return 20; // Aumentar gap para portátiles
    if (width >= 768) return 14;
    return 8;
  }

  private getViewportWidth(): number {
    if (typeof window === 'undefined') {
      return 1024;
    }
    return window.innerWidth;
  }

  getCarouselPages(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i);
  }

  getCurrentPage(): number {
    const visibleCount = this.getVisibleCount();
    return Math.floor(this.currentVoiceIndex / visibleCount);
  }

  getTotalPages(): number {
    const visibleCount = this.getVisibleCount();
    return Math.max(Math.ceil(this.voices.length / visibleCount), 1);
  }

  goToPage(pageIndex: number) {
    const visibleCount = this.getVisibleCount();
    const maxPageIndex = Math.max(
      Math.ceil(this.voices.length / visibleCount) - 1,
      0,
    );
    const targetPage = Math.min(Math.max(pageIndex, 0), maxPageIndex);
    this.currentVoiceIndex = targetPage * visibleCount;
  }

  // Tablet helpers
  getTabletPageVoices() {
    const start = this.tabletPageIndex * 2;
    return this.voices.slice(start, start + 2);
  }

  getTabletTotalPages(): number {
    return Math.max(Math.ceil(this.voices.length / 2), 1);
  }

  getTabletPagesArray(): number[] {
    return Array.from({ length: this.getTabletTotalPages() }, (_, i) => i);
  }

  goToTabletPage(pageIndex: number) {
    this.tabletPageIndex = Math.min(
      Math.max(pageIndex, 0),
      this.getTabletTotalPages() - 1,
    );
  }

  nextTabletPage() {
    if (this.tabletPageIndex < this.getTabletTotalPages() - 1) {
      this.tabletPageIndex += 1;
    }
  }

  previousTabletPage() {
    if (this.tabletPageIndex > 0) {
      this.tabletPageIndex -= 1;
    }
  }

  onTabletTouchStart(event: TouchEvent) {
    if (event.touches.length !== 1) return;
    this.tabletTouchStartX = event.touches[0].clientX;
    this.tabletTouchDeltaX = 0;
  }

  onTabletTouchMove(event: TouchEvent) {
    if (this.tabletTouchStartX === null || event.touches.length !== 1) return;
    const currentX = event.touches[0].clientX;
    this.tabletTouchDeltaX = currentX - this.tabletTouchStartX;
  }

  onTabletTouchEnd() {
    if (this.tabletTouchStartX === null) return;
    if (this.tabletTouchDeltaX > this.tabletSwipeThreshold) {
      this.previousTabletPage();
    } else if (this.tabletTouchDeltaX < -this.tabletSwipeThreshold) {
      this.nextTabletPage();
    }
    this.tabletTouchStartX = null;
    this.tabletTouchDeltaX = 0;
  }

  goBack() {
    if (this.step === 'connectPhone') {
      this.setStep('summary');
    } else if (this.step === 'summary') {
      this.setStep('knowledgeBase');
    } else if (this.step === 'knowledgeBase') {
      this.setStep('instructions');
    } else if (this.step === 'instructions') {
      if (this.isOutboundAgentFlow) {
        this.setStep('campaign');
        return;
      }
      this.setStep(this.skipShopifyBusinessStep ? 'voices' : 'connectBusiness');
    } else if (this.step === 'connectBusiness') {
      this.setStep('voices');
      this.loadVoices();
    } else if (this.step === 'campaign') {
      this.setStep('connectBusiness');
    } else if (this.step === 'importCsv') {
      this.setStep('instructions');
    } else if (this.step === 'segmentation') {
      this.setStep('importCsv');
    } else if (this.step === 'scheduleCampaign') {
      this.setStep('segmentation');
    } else if (this.step === 'voices') {
      this.pauseVoice();
      this.setStep('language');
    } else if (this.step === 'language') {
      this.setStep('agentName');
    } else if (this.step === 'agentName') {
      this.location.back();
    }
  }

  onSkip() {
    if (this.step === 'agentName') {
      this.setStep('language');
    } else if (this.step === 'language') {
      this.setStep('voices');
      this.loadVoices();
    } else if (this.step === 'voices') {
      this.pauseVoice();
      if (!this.tryAdvanceFromVoicesStepAfterLanguageAndVoice()) {
        return;
      }
    } else if (this.step === 'campaign') {
      if (!this.selectedOutboundCampaign) {
        return;
      }
      this.setStep('instructions');
      this.saveDraft();
    } else if (this.step === 'importCsv') {
      this.setStep('segmentation');
      this.saveDraft();
    } else if (this.step === 'segmentation') {
      this.setStep('scheduleCampaign');
      this.saveDraft();
    } else if (this.step === 'scheduleCampaign') {
      this.completeOutboundInstructionsPhase();
    } else if (this.step === 'connectBusiness') {
      if (this.isOutboundAgentFlow) {
        this.continueOutboundAfterConnectBusiness();
        return;
      }
      this.setStep('instructions');
    } else if (this.step === 'instructions') {
      if (this.isOutboundAgentFlow) {
        this.setStep('importCsv');
        this.saveDraft();
        return;
      }
      this.setStep('knowledgeBase');
    } else if (this.step === 'knowledgeBase') {
      this.setStep('summary');
    } else if (this.step === 'summary') {
      this.setStep('connectPhone');
      this.showTwilioConfig = false;
      this.saveDraft();
    } else if (this.step === 'connectPhone') {
      this.createAgentAfterValidation();
      this.logSavedData();
    }
  }

  // Continuar desde el paso de nombre del agente
  onSubmitAgentName() {
    const name = this.agentName?.trim();
    if (!name) {
      this.modalService.openError({
        title: 'Nombre requerido',
        message: 'Por favor, ingresa un nombre para el agente.',
      });
      return;
    }
    this.setStep('language');
    this.saveDraft();
  }

  /** Códigos de idioma con muestras en assets/voces (nombre_idioma.mp3). */
  private readonly VOCES_LANG_CODES: readonly string[] = [
    'es',
    'en',
    'it',
    'de',
    'fr',
  ];

  playVoice(voice: { id?: string; name?: string; voiceId?: string }) {
    // Usar el nombre de la voz para buscar el audio (como en edit-agent)
    const voiceName = voice?.name?.toLowerCase() || '';
    if (!voiceName) {
      console.error('No se proporcionó nombre de voz');
      return;
    }

    // Usar id o voiceId para identificar la voz actualmente reproduciendo
    const voiceIdentifier = voice?.id || voice?.voiceId || '';
    if (!voiceIdentifier) {
      console.error('No se proporcionó identificador de voz');
      return;
    }

    if (this.isPlaying && this.currentPlayingVoice === voiceIdentifier) {
      this.pauseVoice();
      return;
    }

    // Usar el código del idioma seleccionado en la pantalla de "Idiomas" (selectedCountry)
    // Este es el código que se selecciona cuando el usuario hace clic en un idioma
    if (!this.selectedCountry) {
      console.warn('No hay idioma seleccionado, usando español por defecto');
      this.modalService.openError({
        title: 'Error',
        message:
          'Por favor, selecciona un idioma primero en la pantalla de "Idiomas".',
      });
      return;
    }

    let lang = this.selectedCountry;

    // Mapear códigos especiales a códigos de idioma válidos para los archivos de audio
    // Los archivos de audio usan códigos como: es, en, it, de, fr
    if (lang === 'us') {
      lang = 'en'; // Inglés Americano -> inglés
    } else if (!this.VOCES_LANG_CODES.includes(lang)) {
      // Si el código no está en los códigos válidos, usar español como fallback
      console.warn(
        `Código de idioma '${lang}' no válido, usando español como fallback`,
      );
      lang = 'es';
    }

    // Normalizar el nombre de la voz: eliminar acentos y caracteres especiales
    const normalizedVoiceName = this.normalizeVoiceName(voiceName);
    const path = `assets/voces/${normalizedVoiceName}_${lang}.mp3`;

    if (this.audioActual) {
      this.audioActual.pause();
      this.audioActual.currentTime = 0;
    }

    const audio = new Audio(path);
    this.audioActual = audio;
    this.isPlaying = true;
    this.currentPlayingVoice = voiceIdentifier;

    // Configurar manejadores de eventos antes de intentar reproducir
    audio.onerror = (error) => {
      console.error('Error al cargar el audio:', {
        path,
        error,
        voiceName,
        lang,
      });
      this.isPlaying = false;
      this.currentPlayingVoice = null;
      if (this.audioActual === audio) {
        this.audioActual = null;
      }
      this.modalService.openError({
        title: 'Error de audio',
        message: 'No hay muestra de audio para esta voz e idioma.',
      });
    };

    audio.onended = () => {
      this.isPlaying = false;
      this.currentPlayingVoice = null;
      if (this.audioActual === audio) {
        this.audioActual = null;
      }
    };

    audio.play().catch((err) => {
      console.error('Error al reproducir audio:', {
        err,
        path,
        voiceName,
        lang,
      });
      this.isPlaying = false;
      this.currentPlayingVoice = null;
      this.modalService.openError({
        title: 'Error de audio',
        message:
          'No se pudo reproducir el audio. Verifique que el archivo existe.',
        details: `Ruta: ${path}`,
      });
    });
  }

  // Normalizar el nombre de la voz para que coincida con los archivos de audio
  private normalizeVoiceName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD') // Normalizar a NFD (descomponer acentos)
      .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos (acentos)
      .trim();
  }

  pauseVoice() {
    if (this.audioActual) {
      this.audioActual.pause();
      this.audioActual.currentTime = 0;
    }
    this.isPlaying = false;
    this.currentPlayingVoice = null;
    this.audioActual = null;
  }

  onSubmit() {
    if (this.isOutboundAgentFlow) {
      this.setStep('importCsv');
      this.saveDraft();
      return;
    }
    this.setStep('knowledgeBase');
    this.saveDraft();
  }

  onOutboundCampaignScriptsChange(scripts: OutboundCampaignScripts): void {
    this.outboundCampaignScripts = scripts;
    this.saveDraft();
  }

  onOutboundSegmentationNotesChange(notes: string): void {
    this.outboundSegmentationNotes = notes;
    this.saveDraft();
  }

  onOutboundScheduleCampaignNotesChange(notes: string): void {
    this.outboundScheduleCampaignNotes = notes;
    this.saveDraft();
  }

  onOutboundImportCsvPhonesChange(phones: string[]): void {
    this.outboundImportCsvPhones = phones;
    this.saveDraft();
  }

  /**
   * Fin de la fase de instrucciones en saliente: no entra en base de conocimientos / prueba entrante.
   */
  private completeOutboundInstructionsPhase(): void {
    this.saveDraft();
    this.notificationService.info(
      this.i18nService.getTranslations().outboundInstructionsPhaseSaved,
    );
    void this.router.navigate(['/dashboard/agents']);
  }

  /** Navegar a la página de onboarding de Shopify (página externa, sin topbar ni navbar). */
  goToShopifyOnboarding(): void {
    if (this.skipShopifyBusinessStep) {
      this.modalService.openUpgradePlan();
      return;
    }
    this.router.navigate(['/shopify-onboarding']);
  }

  selectAction(platform: string) {
    if (platform === 'shopify') {
      this.goToShopifyOnboarding();
    } else if (platform === 'make') {
      this.showMakeConfig = !this.showMakeConfig;
    }
  }

  toggleMakeConfig() {
    if (this.showMakeConfig) {
      // Iniciar animación de salida (misma duración que sidebar de voces)
      this.isMakeConfigClosing = true;
      setTimeout(() => {
        this.showMakeConfig = false;
        this.isMakeConfigClosing = false;
      }, 280);
    } else {
      this.showMakeConfig = true;
      this.isMakeConfigClosing = false;
    }
  }

  onSaveMakeAction() {
    const { name, serverUrl } = this.makeActionData;
    if (!name.trim() || !serverUrl.trim()) {
      console.warn('Completa nombre y URL del servidor para guardar.');
      return;
    }

    // Webhook generado (mock) — en producción vendría del backend; se conserva al reeditar
    if (!this.makeGeneratedWebhook) {
      this.makeGeneratedWebhook = this.generateMockMakeWebhook();
    }
    this.makeActionActive = true;

    this.isMakeConfigClosing = true;
    setTimeout(() => {
      this.showMakeConfig = false;
      this.isMakeConfigClosing = false;
    }, 280);
  }

  /** URL ficticia para demostrar el flujo tras guardar la acción Make. */
  private generateMockMakeWebhook(): string {
    const token =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID().replace(/-/g, '').slice(0, 32)
        : Math.random().toString(36).slice(2) +
          Math.random().toString(36).slice(2);
    return `https://hooks.llamalo.ai/make/${token}`;
  }

  onEditMakeAction(): void {
    this.showMakeConfig = true;
    this.isMakeConfigClosing = false;
  }

  onDeleteMakeAction(): void {
    const actionLabel = this.makeActionData.name?.trim() || 'esta acción';
    const dialogRef = this.modalService.openWarning({
      title: '',
      message: `¿Seguro que quieres eliminar la acción de Make "${actionLabel}"?`,
      confirmText: 'Sí, eliminar acción',
      cancelText: 'Cancelar',
      showCancelButton: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.makeActionActive = false;
        this.makeGeneratedWebhook = '';
        this.makeActionData = { name: '', description: '', serverUrl: '' };
      }
    });
  }

  toggleTwilioConfig() {
    this.showTwilioConfig = !this.showTwilioConfig;
  }

  // Método para resetear el estado de validación cuando cambian los inputs
  onTwilioSidChange() {
    this.twilioValidationStatus = null;
    this.twilioSidValidationStatus = null;
    this.twilioTokenValidationStatus = null;
    this.twilioErrorMessage = '';
    this.isTwilioValidated = false;
  }

  onTwilioTokenChange() {
    this.twilioValidationStatus = null;
    this.twilioSidValidationStatus = null;
    this.twilioTokenValidationStatus = null;
    this.twilioErrorMessage = '';
    this.isTwilioValidated = false;
  }

  // Método para validar la configuración de Twilio
  validateTwilioConfig() {
    // Validar que ambos campos estén completos
    if (
      !this.twilioSid ||
      !this.twilioToken ||
      !this.twilioSid.trim() ||
      !this.twilioToken.trim()
    ) {
      this.modalService.openError({
        title: 'Campos requeridos',
        message:
          'Por favor, completa tanto el Account SID como el Auth Token antes de validar.',
      });
      return;
    }

    // Resetear estado previo
    this.twilioValidationStatus = null;
    this.twilioErrorMessage = '';
    this.twilioSidValidationStatus = null;
    this.twilioTokenValidationStatus = null;
    this.isValidatingTwilio = true;

    // Preparar la configuración con twilioAccountId si hay una cuenta seleccionada
    const config: {
      twilioSid: string;
      twilioToken: string;
      twilioAccountId?: number;
    } = {
      twilioSid: this.twilioSid.trim(),
      twilioToken: this.twilioToken.trim(),
    };

    // Si hay una cuenta seleccionada, incluir el twilioAccountId para actualizar
    if (this.selectedTwilioAccount) {
      config.twilioAccountId = this.selectedTwilioAccount.twilioAccountId;
    }

    // Llamar al endpoint de validación
    this.twilioService.setConfig(config).subscribe({
      next: (response) => {
        this.isValidatingTwilio = false;
        this.twilioValidationStatus = 'success';
        this.twilioSidValidationStatus = 'success';
        this.twilioTokenValidationStatus = 'success';
        this.isTwilioValidated = true;

        // Si se validó una cuenta nueva (no seleccionada previamente), buscar si existe en las cuentas del usuario
        // y actualizar selectedTwilioAccount para poder cargar números disponibles
        if (!this.selectedTwilioAccount) {
          // Recargar cuentas para obtener el twilioAccountId de la cuenta recién validada
          this.userService.getUserProfile().subscribe({
            next: (profile) => {
              if (profile.twilio && Array.isArray(profile.twilio)) {
                const matchingAccount = profile.twilio.find(
                  (acc) =>
                    acc.twilioSid === this.twilioSid.trim() &&
                    acc.twilioToken === this.twilioToken.trim(),
                );
                if (matchingAccount) {
                  this.selectedTwilioAccount = {
                    twilioAccountId: matchingAccount.twilioAccountId,
                    twilioSid: matchingAccount.twilioSid,
                    twilioToken: matchingAccount.twilioToken,
                  };
                  // Cargar números disponibles para esta cuenta
                  this.loadAvailablePhoneNumbers();
                }
              }
            },
            error: (error) => {
              console.error(
                'Error al obtener perfil después de validar:',
                error,
              );
            },
          });
        } else {
          // Si ya había una cuenta seleccionada, cargar números disponibles
          this.loadAvailablePhoneNumbers();
        }

        // Si ya hay un número de teléfono ingresado, validarlo automáticamente
        if (this.phoneNumber && this.phoneNumber.trim()) {
          this.validatePhoneNumber();
        }
      },
      error: (error: unknown) => {
        this.isValidatingTwilio = false;
        this.twilioValidationStatus = 'error';
        this.twilioSidValidationStatus = 'error';
        this.twilioTokenValidationStatus = 'error';
        this.isTwilioValidated = false;

        const defaultMsg =
          'Error al validar la configuración de Twilio. Por favor, verifica tus credenciales.';
        const httpErr = error as {
          status?: number;
          error?: { message?: string };
        };
        let errorMessage = getApiErrorMessage(error, defaultMsg);
        if (errorMessage === defaultMsg && httpErr?.status === 401) {
          errorMessage =
            'Credenciales inválidas. Por favor, verifica tu Account SID y Auth Token.';
        } else if (errorMessage === defaultMsg && httpErr?.status === 400) {
          errorMessage =
            'Datos inválidos. Por favor, verifica el formato de tus credenciales.';
        }

        this.twilioErrorMessage = errorMessage;
        console.error('❌ Error al validar configuración de Twilio:', error);
      },
    });
  }

  // Getter para verificar si Twilio está completamente validado
  get isTwilioCompletelyValidated(): boolean {
    return (
      this.twilioSidValidationStatus === 'success' &&
      this.twilioTokenValidationStatus === 'success' &&
      this.phoneValidationStatus === 'success' &&
      this.isTwilioValidated
    );
  }

  // Getter para verificar si el botón Continuar debe estar habilitado (solo usado en paso "Conecta tu número")
  get canContinueFromConnections(): boolean {
    return this.isTwilioCompletelyValidated;
  }

  // Método para manejar selección de un número de teléfono disponible (desde connect-phone-step)
  onPhoneNumberSelected(event: { countryCode: string; number: string }) {
    this.phoneNumber = event.number;
    this.selectedCountryCode = event.countryCode.startsWith('+')
      ? event.countryCode
      : '+' + event.countryCode;
    this.validatePhoneNumber();
  }

  // Método para continuar desde "Conecta tu número de teléfono" (crear agente)
  onContinueFromConnections() {
    if (!this.canContinueFromConnections) {
      return;
    }
    this.createAgentAfterValidation();
    this.saveDraft();
  }

  // Continuar desde "Conecta tu negocio": entrante → instrucciones completas; saliente → elegir campaña y luego instrucciones.
  onContinueFromConnectBusiness() {
    if (this.isOutboundAgentFlow) {
      this.continueOutboundAfterConnectBusiness();
      return;
    }
    this.setStep('instructions');
    this.saveDraft();
  }

  /** Tras Shopify en saliente: primero elegir campaña; luego instrucciones recortadas. */
  private continueOutboundAfterConnectBusiness() {
    this.setStep('campaign');
    this.saveDraft();
  }

  // Método para validar automáticamente el número de teléfono
  onPhoneNumberChange() {
    // Limpiar timeout anterior si existe
    if (this.phoneValidationTimeout) {
      clearTimeout(this.phoneValidationTimeout);
    }

    // Resetear estado si el campo está vacío
    if (!this.phoneNumber || !this.phoneNumber.trim()) {
      this.phoneValidationStatus = null;
      this.phoneErrorMessage = '';
      this.isValidatingPhone = false;
      return;
    }

    // Validar que Twilio esté validado primero
    if (!this.isTwilioValidated) {
      this.phoneValidationStatus = null;
      return;
    }

    // Esperar 500ms después de que el usuario deje de escribir (debounce)
    this.phoneValidationTimeout = setTimeout(() => {
      this.validatePhoneNumber();
    }, 500);
  }

  // Método para validar el número de teléfono
  validatePhoneNumber() {
    if (!this.phoneNumber || !this.phoneNumber.trim()) {
      return;
    }

    const countryCode = this.selectedCountryCode || '+34';
    const number = this.phoneNumber.trim();

    // Resetear estado previo
    this.phoneValidationStatus = null;
    this.phoneErrorMessage = '';
    this.isValidatingPhone = true;

    // Obtener twilioAccountId si hay una cuenta seleccionada
    const twilioAccountId = this.selectedTwilioAccount?.twilioAccountId;

    // Llamar al endpoint de validación
    this.twilioService
      .validatePhone(countryCode, number, twilioAccountId)
      .subscribe({
        next: (response) => {
          this.isValidatingPhone = false;
          this.phoneValidationStatus = 'success';
        },
        error: (error) => {
          this.isValidatingPhone = false;
          this.phoneValidationStatus = 'error';

          // Extraer mensaje de error
          let errorMessage =
            'Error al validar el número de teléfono. Por favor, intenta nuevamente.';

          if (error.status === 400) {
            errorMessage =
              error?.error?.message ||
              'Número no disponible. Por favor, verifica que el número sea correcto y esté disponible en Twilio.';
          } else if (error.status === 401) {
            errorMessage =
              'Token inválido o expirado. Por favor, inicia sesión nuevamente.';
          } else if (error.status === 404) {
            errorMessage =
              'Usuario no encontrado o configuración de Twilio no encontrada. Por favor, verifica tu configuración.';
          } else if (error?.error?.message) {
            errorMessage = error.error.message;
          }

          this.phoneErrorMessage = errorMessage;
          console.error('❌ Error al validar número:', error);
        },
      });
  }

  // Propiedades para documentos PDF
  uploadedDocuments: File[] = [];
  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef<HTMLInputElement>;

  // ✅ Nuevos métodos para la pantalla de Base de Conocimientos
  selectKnowledgeSource(source: 'pdf' | 'web' | 'text') {
    if (source === 'web') {
      // Abrir modal de Web
      const dialogRef = this.modalService.openWeb({
        title: 'Web',
      });

      dialogRef.afterClosed().subscribe((result) => {});
    } else if (source === 'pdf') {
      // Abrir selector de archivos para PDF
      this.openFileSelector();
    } else if (source === 'text') {
      // Abrir modal de Texto
      const dialogRef = this.modalService.openText({
        title: 'Texto',
      });

      dialogRef.afterClosed().subscribe((result) => {});
    } else {
      // Para otros casos, avanzar automáticamente a resumen
      this.step = 'summary';
    }
  }

  // Wrapper method for the component event
  onSourceSelected(source: string) {
    this.selectKnowledgeSource(source as 'pdf' | 'web' | 'text');
  }

  // Method to handle knowledge base continue with selected sources
  onKnowledgeBaseContinue(selectedSourceIds: string[]) {
    this.selectedKnowledgeSourceIds = selectedSourceIds;
    this.setStep('summary');
    this.saveDraft();
  }

  openFileSelector() {
    // Usar el ViewChild si existe, sino crear uno dinámicamente
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    } else {
      // Crear input de archivo dinámicamente si no existe
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf';
      input.multiple = true;
      input.style.display = 'none';
      input.addEventListener('change', (event: any) => {
        this.handleFileSelection(event.target.files);
      });
      document.body.appendChild(input);
      input.click();
      // Remover el input después de usarlo
      setTimeout(() => {
        document.body.removeChild(input);
      }, 100);
    }
  }

  handleFileSelection(files: FileList | null) {
    if (files && files.length > 0) {
      // Convertir FileList a Array
      const newFiles = Array.from(files);

      // Calcular cuántos archivos se pueden agregar (máximo 2 en total)
      const availableSlots = 2 - this.uploadedDocuments.length;

      if (availableSlots > 0) {
        // Agregar solo los archivos que quepan (máximo hasta completar 2)
        const filesToAdd = newFiles.slice(0, availableSlots);
        this.uploadedDocuments = [...this.uploadedDocuments, ...filesToAdd];

        // Si el usuario intentó subir más archivos de los permitidos, mostrar modal
        if (newFiles.length > availableSlots) {
          this.modalService.openWarning({
            title: 'Límite de archivos',
            message: `Solo puedes subir un máximo de 2 archivos. Se agregaron ${filesToAdd.length} de ${newFiles.length} archivos seleccionados.`,
          });
        }
      } else {
        // Si ya se alcanzó el límite, mostrar modal
        this.modalService.openWarning({
          title: 'Límite alcanzado',
          message:
            'Solo puedes subir 2 documentos. Por favor, elimina algunos antes de agregar nuevos.',
        });
      }
    }
  }

  get uploadedDocumentsCount(): number {
    return this.uploadedDocuments.length;
  }

  clearUploadedDocuments() {
    this.uploadedDocuments = [];
  }

  // Opcional: Método para continuar sin elegir fuente
  continueWithoutSource() {
    this.setStep('summary'); // Pasa a resumen
    this.saveDraft();
  }

  onSubmitTestCall() {
    // Ir a Conecta tu número de teléfono
    this.setStep('connectPhone');
    this.showTwilioConfig = false;
    this.loadTwilioAccounts();
    this.saveDraft();
  }

  // Método para cargar las cuentas de Twilio del usuario
  loadTwilioAccounts() {
    this.loadingTwilioAccounts = true;
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        this.loadingTwilioAccounts = false;
        if (
          profile.twilio &&
          Array.isArray(profile.twilio) &&
          profile.twilio.length > 0
        ) {
          this.twilioAccounts = profile.twilio.map((account) => ({
            twilioAccountId: account.twilioAccountId,
            twilioSid: account.twilioSid,
            twilioToken: account.twilioToken,
          }));
          // Si hay cuentas, mostrar la lista (no el formulario)
          this.showNewTwilioAccountForm = false;
        } else {
          this.twilioAccounts = [];
          // Si no hay cuentas, mostrar el formulario directamente
          this.showNewTwilioAccountForm = true;
        }
      },
      error: (error) => {
        this.loadingTwilioAccounts = false;
        console.error('Error al cargar cuentas de Twilio:', error);
        this.twilioAccounts = [];
        this.showNewTwilioAccountForm = true;
      },
    });
  }

  // Método para usar una cuenta de Twilio existente
  useExistingTwilioAccount(account: {
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  }) {
    this.selectedTwilioAccount = account;
    this.twilioSid = account.twilioSid;
    this.twilioToken = account.twilioToken;
    this.showNewTwilioAccountForm = false;

    // Resetear validaciones de teléfono pero mantener Twilio como válido si ya estaba
    this.phoneValidationStatus = null;
    this.phoneErrorMessage = '';
    this.phoneNumber = ''; // Limpiar número anterior

    // Validar automáticamente la cuenta seleccionada
    // Esto establecerá isTwilioValidated = true cuando termine
    this.validateTwilioConfig();

    // Cargar números de teléfono disponibles para esta cuenta
    this.loadAvailablePhoneNumbers();
  }

  // Método para mostrar el formulario de nueva cuenta
  showNewTwilioAccount() {
    this.selectedTwilioAccount = null;
    this.twilioSid = '';
    this.twilioToken = '';
    this.showNewTwilioAccountForm = true;
    this.showTwilioConfig = true; // Asegurar que el panel esté abierto
    this.twilioValidationStatus = null;
    this.twilioSidValidationStatus = null;
    this.twilioTokenValidationStatus = null;
    this.isTwilioValidated = false;
    this.phoneValidationStatus = null;
    this.phoneErrorMessage = '';
    this.phoneNumber = ''; // Limpiar número
    this.availablePhoneNumbers = [];
  }

  // Método para volver a la selección de cuenta (cuando se cierra el formulario de nueva cuenta)
  backToAccountSelection() {
    this.showNewTwilioAccountForm = false;
    this.selectedTwilioAccount = null;
    this.twilioSid = '';
    this.twilioToken = '';
    this.twilioValidationStatus = null;
    this.twilioSidValidationStatus = null;
    this.twilioTokenValidationStatus = null;
    this.isTwilioValidated = false;
    this.phoneValidationStatus = null;
    this.phoneErrorMessage = '';
    this.phoneNumber = '';
    this.availablePhoneNumbers = [];
  }

  // Método para manejar el click en el botón de conectar/cerrar
  onTwilioConnectButtonClick(event: Event) {
    event.stopPropagation();
    if (this.showNewTwilioAccountForm) {
      this.backToAccountSelection();
    } else if (this.selectedTwilioAccount && this.isTwilioValidated) {
      // Si hay una cuenta seleccionada y validada, volver a la selección de cuentas
      this.backToAccountSelection();
      this.showTwilioConfig = true; // Mantener el panel abierto para mostrar las cuentas
    } else {
      this.showTwilioConfig = !this.showTwilioConfig;
    }
  }

  // Método para cargar números de teléfono disponibles filtrados
  loadAvailablePhoneNumbers() {
    if (!this.selectedTwilioAccount) {
      this.availablePhoneNumbers = [];
      return;
    }

    this.loadingPhoneNumbers = true;
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        this.loadingPhoneNumbers = false;

        // Obtener números de teléfono del usuario
        const allPhoneNumbers = profile.phoneNumbers || [];

        // Obtener números asociados a agentes
        const agentPhoneNumbers = new Set<string>();
        if (profile.agents && Array.isArray(profile.agents)) {
          profile.agents.forEach((agent) => {
            if (agent.phoneNumbers) {
              const phoneKey = `${agent.phoneNumbers.countryCode}${agent.phoneNumbers.number}`;
              agentPhoneNumbers.add(phoneKey);
            }
          });
        }

        // Filtrar números:
        // 1. Que pertenezcan a la cuenta de Twilio seleccionada
        // 2. Que NO estén asociados a ningún agente
        this.availablePhoneNumbers = allPhoneNumbers.filter((phone) => {
          // Filtrar por cuenta de Twilio
          const belongsToAccount =
            phone.twilioAccountId ===
            this.selectedTwilioAccount!.twilioAccountId;

          // Verificar que no esté asociado a ningún agente
          const phoneKey = `${phone.countryCode}${phone.number}`;
          const notInAgents = !agentPhoneNumbers.has(phoneKey);

          return belongsToAccount && notInAgents;
        });
      },
      error: (error) => {
        this.loadingPhoneNumbers = false;
        console.error('Error al cargar números de teléfono:', error);
        this.availablePhoneNumbers = [];
      },
    });
  }

  // Método para mostrar datos guardados
  private logSavedData() {
    const currentVoice = this.getCurrentVoice();
    // Usar el voiceId guardado cuando se seleccionó la voz, o obtenerlo de la voz actual como fallback
    const voiceId =
      this.selectedVoiceId ||
      (currentVoice ? (currentVoice as any)?.voiceId || currentVoice.id : null);
    const savedData = {
      agentName: this.agentName,
      selectedCallType: this.selectedCallType,
      language: this.selectedCountry, // Código del país como idioma
      voice: currentVoice
        ? {
            name: currentVoice.name,
            voiceId: voiceId,
          }
        : null,
      greeting: this.greeting,
      instructions: this.instructions,
      phoneNumber: this.phoneNumber,
      selectedCountryCode: this.selectedCountryCode,
      label: this.label,
    };
  }

  // Métodos para conectar número de teléfono
  onConnectPhone() {
    // Validar datos requeridos
    if (!this.phoneNumber || !this.phoneNumber.trim()) {
      this.notificationService.error(
        'Por favor, ingresa un número de teléfono válido.',
      );
      return;
    }

    if (!this.selectedVoiceId) {
      const currentVoice = this.getCurrentVoice();
      if (!currentVoice) {
        this.notificationService.error(
          'Por favor, selecciona una voz para el agente.',
        );
        return;
      }
    }

    const countryCode = this.selectedCountryCode || '+34';
    const number = this.phoneNumber.trim();

    // Obtener twilioAccountId si hay una cuenta seleccionada
    const twilioAccountId = this.selectedTwilioAccount?.twilioAccountId;

    // Primero validar el número de teléfono
    this.twilioService
      .validatePhone(countryCode, number, twilioAccountId)
      .subscribe({
        next: (response) => {
          // Si la validación es exitosa, proceder a crear el agente
          this.createAgentAfterValidation();
        },
        error: (error) => {
          console.error('❌ Error al validar número:', error);

          // Manejar diferentes tipos de errores
          let errorMessage =
            'Error al validar el número de teléfono. Por favor, intenta nuevamente.';

          if (error.status === 400) {
            errorMessage =
              error?.error?.message ||
              'Número no disponible. Por favor, verifica que el número sea correcto y esté disponible en Twilio.';
          } else if (error.status === 401) {
            errorMessage =
              'Token inválido o expirado. Por favor, inicia sesión nuevamente.';
          } else if (error.status === 404) {
            errorMessage =
              'Usuario no encontrado o configuración de Twilio no encontrada. Por favor, verifica tu configuración en Ajustes > Conexiones > Twilio.';
          } else if (error?.error?.message) {
            errorMessage = error.error.message;
          }

          this.notificationService.error(errorMessage);
        },
      });
  }

  // Método para crear el agente después de validar el número
  private createAgentAfterValidation() {
    if (!canAddAnotherAgent(this.userStore.user()?.planUsage)) {
      const t = this.i18nService.getTranslations();
      this.modalService
        .openWarning({
          message: `${t.planLimitModalTitle}: ${t.http403PlanBlocked}`,
          confirmText: t.planLimitModalCta,
          cancelText: t.cancelBtn,
        })
        .afterClosed()
        .subscribe((ok) => {
          if (ok) void this.router.navigate(['/billing']);
        });
      return;
    }

    // Construir el objeto que se enviará al endpoint
    // Usar el voiceId guardado cuando se seleccionó la voz, o obtenerlo de la voz actual como fallback
    const voiceId =
      this.selectedVoiceId ||
      (() => {
        const currentVoice = this.getCurrentVoice();
        return (currentVoice as any)?.voiceId || currentVoice?.id || '';
      })();

    const agentConfig: SetAgentConfigDto = {
      name: this.agentName || 'Agente',
      language: this.selectedCountry || 'es', // Usar código del país como idioma
      type: this.selectedCallType || 'inbound',
      twilioAccountId: Number(this.selectedTwilioAccount?.twilioAccountId ?? 0),
      voiceId: voiceId,
      // Fallback a un string vacío en caso de outbound donde greeting e instructions no se rellenan
      firstInteraction: this.greeting || (this.selectedCallType === 'outbound' ? 'Llamada saliente' : ''),
      agentInstruction: this.instructions || (this.selectedCallType === 'outbound' ? 'Instrucciones salientes gestionadas por campaña.' : ''),
      phoneNumbers: {
        countryCode: this.selectedCountryCode || '+34',
        number: Number(this.phoneNumber) || 0,
      },
      label:
        this.label ||
        `${this.agentName || 'Agente'} - ${this.selectedCountry || 'es'}`,
      parameters: {
        stability: this.voiceParameters.stability,
        similarity: this.voiceParameters.similarity,
        style: this.voiceParameters.style,
        boost: this.voiceParameters.boost,
        speed: this.voiceParameters.speed,
      },
      state: 'Activo',
      knowledgeSourceIds:
        this.selectedKnowledgeSourceIds.length > 0
          ? this.selectedKnowledgeSourceIds
          : undefined,
      ...(this.shopifyConnectedDomain && {
        shopifyDomain: this.shopifyConnectedDomain,
      }),
      // Añadir campos de outbound si es un agente saliente
      ...(this.selectedCallType === 'outbound' && {
        outboundCampaignKind: this.selectedOutboundCampaign ?? undefined,
        outboundCampaignScripts: this.outboundCampaignScripts,
        outboundImportCsvPhones: this.outboundImportCsvPhones,
        outboundSegmentationNotes: this.outboundSegmentationNotes,
        outboundScheduleCampaignNotes: this.outboundScheduleCampaignNotes,
      }),
    };

    // Navegar a pantalla de carga
    this.setStep('final');

    // Enviar petición al backend
    this.agentsService.createAgent(agentConfig).subscribe({
      next: (response) => {
        // Si hay fuentes de conocimiento seleccionadas, vincularlas al agente
        if (this.selectedKnowledgeSourceIds.length > 0 && response?.agentId) {
          this.knowledgeBaseService
            .linkKnowledgeSourcesToAgent(response.agentId, {
              sourceIds: this.selectedKnowledgeSourceIds,
            })
            .subscribe({
              next: () => {
                console.info(
                  '✅ Fuentes de conocimiento vinculadas exitosamente',
                );
              },
              error: (error) => {
                console.error(
                  '❌ Error al vincular fuentes de conocimiento:',
                  error,
                );
                // No mostramos error al usuario ya que el agente se creó correctamente
              },
            });
        }

        // Cambiar a pantalla de éxito
        this.setStep('success');
        // Limpiar el borrador cuando el agente se crea con éxito
        this.clearSavedDraft();
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Error al crear agente:', error);
        this.setStep('summary');
        if (error.status === 403) {
          openPlanLimitDialog(
            this.modalService,
            this.router,
            this.i18nService,
            error,
          );
          return;
        }
        const errorMessage =
          error?.error?.message ||
          error?.message ||
          'Error al crear el agente. Por favor, intenta nuevamente.';
        this.notificationService.error(errorMessage);
      },
    });
  }

  openTwilioStepsModal() {
    this.modalService.openTwilioSteps();
  }

  // Declare showCountryMenu property
  showCountryMenu = false;
  selectedCountryCode = '+34';
  selectedCountry = 'es';

  toggleCountryMenu() {
    this.showCountryMenu = !this.showCountryMenu;
    // Forzar detección de cambios para actualizar la posición del menú
    if (this.showCountryMenu && this.isBrowser) {
      setTimeout(() => {
        // Esto fuerza a Angular a actualizar la vista
      }, 0);
    }
  }

  // Métodos para calcular la posición del menú desplegable
  getCountryMenuTop(): number {
    if (!this.isBrowser || !this.countryDropdown) return 0;
    try {
      const rect = this.countryDropdown.nativeElement.getBoundingClientRect();
      return rect.bottom + 4; // mt-1 = 4px
    } catch {
      return 0;
    }
  }

  getCountryMenuLeft(): number {
    if (!this.isBrowser || !this.countryDropdown) return 0;
    try {
      const rect = this.countryDropdown.nativeElement.getBoundingClientRect();
      return rect.left;
    } catch {
      return 0;
    }
  }

  selectCountry(
    countryCode: string,
    code?: string,
    flagColor1?: string,
    flagColor2?: string,
  ) {
    // Si solo se pasa el código del país, usar el mapeo
    if (!code) {
      const countryCodeMap: { [key: string]: string } = {
        es: '+34',
        en: '+44',
        fr: '+33',
        it: '+39',
        de: '+49',
        pt: '+351',
        us: '+1',
        tr: '+90',
        se: '+46',
        nl: '+31',
      };
      this.pauseVoice(); // Detener audio cuando cambia de país/idioma
      this.selectedCountryCode = countryCodeMap[countryCode] || '+34';
      this.selectedCountry = countryCode;
      this.showCountryDropdown = false;
      this.loadVoices();
      return;
    }

    // Comportamiento original con 4 parámetros
    this.selectedCountryCode = code;
    this.selectedCountry = countryCode;
    this.showCountryMenu = false;
    this.updateFlag(countryCode);

    // Resetear validación del teléfono cuando cambia el prefijo
    if (this.phoneNumber && this.phoneNumber.trim()) {
      this.phoneValidationStatus = null;
      this.phoneErrorMessage = '';
      // Revalidar automáticamente con el nuevo prefijo
      this.validatePhoneNumber();
    }
  }

  // Método para manejar el click en el dropdown de país (solo si Twilio está validado)
  onCountryDropdownClick(event: Event) {
    if (this.isTwilioValidated && !this.isValidatingTwilio) {
      this.toggleCountryMenu();
      event.stopPropagation();
    }
  }

  updateFlag(countryCode: string) {
    const flagSvg = document.getElementById('current-flag');
    if (!flagSvg) return;

    // Limpiar el contenido anterior
    flagSvg.innerHTML = '';

    switch (countryCode) {
      case 'es':
        flagSvg.innerHTML =
          '<rect width="20" height="12" fill="#C60B1E"/><rect y="3" width="20" height="6" fill="#FFC400"/>';
        break;
      case 'us':
        flagSvg.innerHTML =
          '<rect width="20" height="12" fill="#00247D"/><path d="M0 0L20 12M20 0L0 12" stroke="#FFF" stroke-width="2"/><path d="M0 0L20 12M20 0L0 12" stroke="#CF142B" stroke-width="1"/><rect x="8" width="4" height="12" fill="#FFF"/><rect y="4" width="20" height="4" fill="#FFF"/><rect x="8.8" width="2.4" height="12" fill="#CF142B"/><rect y="5.2" width="20" height="1.6" fill="#CF142B"/>';
        break;
      case 'fr':
        flagSvg.innerHTML =
          '<rect width="20" height="12" fill="#fff"/><rect width="6.66" height="12" fill="#0055A4"/><rect x="13.33" width="6.67" height="12" fill="#EF4135"/>';
        break;
      case 'de':
        flagSvg.innerHTML =
          '<rect width="20" height="12" fill="#FFCE00"/><rect y="6" width="20" height="6" fill="#DD0000"/><rect y="4" width="20" height="4" fill="#000"/>';
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target) return;

    // Manejar clics para limpiar selección de idioma pendiente
    this.handleLanguageSelectionClick(event);

    // Buscar si el click fue dentro del dropdown o del menú
    const dropdown =
      target.closest('[class*="w-28"]') || target.closest('[class*="w-36"]');
    const menu = target.closest('ul');
    const menuItem = target.closest('li');

    // Solo cerrar si el click fue fuera del dropdown y del menú
    if (!dropdown && !menu && !menuItem) {
      this.showCountryMenu = false;
    }
  }

  // Nuevas propiedades
  inactivityTimeout = 0; // Tiempo de inactividad en segundos
  maxCallDuration = 0; // Duración máxima en segundos
  agentSpeed = 0; // Rapidez del agente
  llmTemperature = 0; // Temperatura del LLM
  isRecordingNoticeEnabled = false;
  recordingNoticeText =
    'Le informamos que esta llamada será grabada con fines de calidad y seguridad. Puede consultar más información sobre el tratamiento de sus datos en nuestra política de privacidad.';

  // Parámetros de voz
  voiceParameters: VoiceParameters = {
    stability: 0.5, // 0-1.0
    similarity: 0.8, // 0-1.0
    style: 0.5, // 0-1.0
    boost: true, // true/false
    speed: 0.98, // 0.25-4.0
  };

  // Estados de visibilidad de los bocadillos
  showInactivityTooltip = false;
  showMaxCallDurationTooltip = false;
  showAgentSpeedTooltip = false;
  showLlmTemperatureTooltip = false;

  // Métodos para mostrar/ocultar bocadillos
  showInactivityTooltipFn() {
    this.hideAllTooltips();
    this.showInactivityTooltip = true;
  }

  hideInactivityTooltipFn() {
    this.showInactivityTooltip = false;
  }

  showMaxCallDurationTooltipFn() {
    this.hideAllTooltips();
    this.showMaxCallDurationTooltip = true;
  }

  hideMaxCallDurationTooltipFn() {
    this.showMaxCallDurationTooltip = false;
  }

  showAgentSpeedTooltipFn() {
    this.hideAllTooltips();
    this.showAgentSpeedTooltip = true;
  }

  hideAgentSpeedTooltipFn() {
    this.showAgentSpeedTooltip = false;
  }

  showLlmTemperatureTooltipFn() {
    this.hideAllTooltips();
    this.showLlmTemperatureTooltip = true;
  }

  hideLlmTemperatureTooltipFn() {
    this.showLlmTemperatureTooltip = false;
  }

  // Método para ocultar todos los bocadillos
  hideAllTooltips() {
    this.showInactivityTooltip = false;
    this.showMaxCallDurationTooltip = false;
    this.showAgentSpeedTooltip = false;
    this.showLlmTemperatureTooltip = false;
  }

  // Método para cambiar el estado del aviso de grabación
  toggleRecordingNotice() {
    this.isRecordingNoticeEnabled = !this.isRecordingNoticeEnabled;
  }

  // Método para abrir el modal de información sobre el aviso de grabación
  openRecordingNoticeInfoModal() {
    this.notificationService.info(
      'El mensaje de aviso de grabación es una notificación que se reproduce al inicio de las llamadas para informar a los interlocutores que la conversación será grabada.',
    );
  }

  // Método para formatear el tiempo en formato legible
  formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0
        ? `${minutes} ${remainingSeconds}`
        : `${minutes}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      return remainingMinutes > 0 ? `${hours} ${remainingMinutes}` : `${hours}`;
    }
  }

  // Método para obtener el tiempo de inactividad formateado
  getFormattedInactivityTimeout(): string {
    return this.formatTime(this.inactivityTimeout);
  }

  // Método para obtener la duración máxima formateada
  getFormattedMaxCallDuration(): string {
    return this.formatTime(this.maxCallDuration);
  }

  // Método para actualizar el tiempo de inactividad
  updateInactivityTimeout(value: number) {
    this.inactivityTimeout = value;
  }

  // Método para actualizar la duración máxima
  updateMaxCallDuration(value: number) {
    this.maxCallDuration = value;
  }

  // Método para validar la configuración avanzada
  validateAdvancedSettings(): boolean {
    if (this.inactivityTimeout < 0 || this.inactivityTimeout > 300) {
      this.notificationService.error(
        'El tiempo de inactividad debe estar entre 0 y 300 segundos',
      );
      return false;
    }

    if (this.maxCallDuration < 60 || this.maxCallDuration > 3600) {
      this.notificationService.error(
        'La duración máxima debe estar entre 60 y 3600 segundos',
      );
      return false;
    }

    return true;
  }

  onSubmitAdvancedSettings() {
    if (this.validateAdvancedSettings()) {
      // Cambia a prueba de agente
      this.setStep('summary');
      this.animateIdle();
      this.saveDraft();
    }
  }

  // Método para saltar la configuración avanzada
  onSkipAdvancedSettings() {
    // Avanza a prueba de agente
    this.setStep('summary');
    this.animateIdle();
  }

  // Método para finalizar el proceso
  onFinish() {
    // Limpiar el micrófono si está activo
    this.stopMicrophone();
    // Ir siempre a la lista de agentes (evita volver a shopify-onboarding/success si el usuario vino de ahí)
    this.router.navigate(['/dashboard/agents']);
  }

  // Método para ir a la página de agentes desde el paso de éxito
  goToAgents() {
    this.router.navigate(['/dashboard/agents']);
  }

  // Métodos para el micrófono
  async toggleMicrophone() {
    if (this.isMicrophoneActive) {
      this.stopMicrophone();
      this.animateIdle();
    } else {
      await this.startMicrophone();
    }
  }

  async startMicrophone() {
    try {
      // Solicitar acceso al micrófono con configuración optimizada
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
        },
      });

      // Crear contexto de audio optimizado
      this.audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(stream);

      // Configurar el analizador para una detección más limpia y menos sensible al ruido de fondo
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.4; // Un poco más de suavizado
      this.analyser.minDecibels = -60; // Ignorar ruidos más bajos (antes -70)
      this.analyser.maxDecibels = -10;
      this.microphone.connect(this.analyser);

      this.isMicrophoneActive = true;
      this.animateAudioLevel();
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      this.notificationService.error(
        'No se pudo acceder al micrófono. Verifica los permisos.',
      );
    }
  }

  stopMicrophone() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.isMicrophoneActive = false;
    this.audioLevel = 0;
  }

  private animateIdle() {
    const animate = () => {
      // Detener si el micrófono se activa o si no estamos en el navegador
      if (
        !this.isBrowser ||
        this.isMicrophoneActive ||
        this.step !== 'summary'
      ) {
        return;
      }

      // Pulso sinusoidal suave para el estado idle
      this.audioLevel = Math.sin(Date.now() / 1000) * 0.2 + 0.1;
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  animateAudioLevel() {
    if (!this.isMicrophoneActive || !this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const updateLevel = () => {
      this.analyser!.getByteFrequencyData(dataArray);

      // Calcular el nivel máximo para respuesta más rápida
      let max = 0;
      for (let i = 0; i < dataArray.length; i++) {
        max = Math.max(max, dataArray[i]);
      }

      // Normalizar el nivel (0-1) con respuesta más rápida
      let normalizedLevel = max / 255;

      // Aplicar una curva lineal para reducir la hipersensibilidad a sonidos bajos
      normalizedLevel = Math.min(normalizedLevel, 1.0);

      // Transición ajustada: menos multiplicador para una reacción más natural
      const targetLevel = normalizedLevel * 1.8;
      this.audioLevel = this.audioLevel * 0.75 + targetLevel * 0.25;

      // Límite de seguridad
      this.audioLevel = Math.min(this.audioLevel, 3.5);

      if (this.isMicrophoneActive) {
        this.animationFrame = requestAnimationFrame(updateLevel);
      }
    };

    updateLevel();
  }

  ngAfterViewChecked() {
    // Inicializar Lottie cuando el step es 'final' y el contenedor está disponible
    if (
      this.step === 'final' &&
      this.lottieContainer &&
      !this.lottieInitialized
    ) {
      this.initLottie();
    } else if (this.step !== 'final' && this.lottieInitialized) {
      // Limpiar Lottie si cambiamos de step
      this.destroyLottie();
    }
  }

  initLottie() {
    if (
      this.lottieContainer &&
      this.lottieContainer.nativeElement &&
      !this.lottieInstance
    ) {
      this.lottieInstance = lottie.loadAnimation({
        container: this.lottieContainer.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'assets/Loading.json',
      });
      this.lottieInitialized = true;
    }
  }

  destroyLottie() {
    if (this.lottieInstance) {
      this.lottieInstance.destroy();
      this.lottieInstance = null;
      this.lottieInitialized = false;
    }
  }

  ngOnDestroy() {
    // Guardar borrador al salir para que "Recuperar" restaure paso y datos
    this.saveDraft();
    // Limpiar timeout de validación de teléfono si existe
    if (this.phoneValidationTimeout) {
      clearTimeout(this.phoneValidationTimeout);
    }
    // Limpiar el micrófono cuando se destruye el componente
    this.stopMicrophone();
    // Limpiar Lottie
    this.destroyLottie();
    // Quitar clase del body para el widget de soporte
    if (this.isBrowser) {
      document.body.classList.remove('creating-agent');
      document.body.style.overflow = '';
    }
    if (this.stepFadeTimeout) {
      clearTimeout(this.stepFadeTimeout);
    }
  }

  /** Guardar borrador al cerrar pestaña o salir de la página (navegación externa). */
  @HostListener('window:beforeunload')
  onBeforeUnload() {
    this.saveDraft();
  }

  // Métodos para calcular tamaños y posiciones dinámicas estilo ChatGPT
  getWaveSize(waveNumber: number): number {
    const baseSize = 120;
    const increment = waveNumber * 40;
    return baseSize + increment;
  }

  getCloudSize(cloudNumber: number): number {
    const baseSize = 30 + cloudNumber * 15;
    return baseSize + this.audioLevel * 20;
  }

  getCloudPosition(cloudNumber: number): { x: number; y: number } {
    const centerOffset = 60;
    const angle = cloudNumber * 120 + this.audioLevel * 30;
    const radius = 80 + this.audioLevel * 40;

    return {
      x: Math.cos((angle * Math.PI) / 180) * radius - centerOffset,
      y: Math.sin((angle * Math.PI) / 180) * radius - centerOffset,
    };
  }

  getMainSphereSize(): number {
    if (!this.isBrowser) return 160;
    const viewportWidth = window.innerWidth;

    // Tamaños reducidos para una estética más refinada y menos invasiva
    if (viewportWidth >= 1920) return 200; // 3xl
    if (viewportWidth >= 1280) return 160; // Desktop grande
    return 130; // Laptops y tablets
  }

  getMicButtonSize(): number {
    const sphereSize = this.getMainSphereSize();
    return Math.min(sphereSize * 0.4, 50);
  }

  getMicIconSize(): number {
    const buttonSize = this.getMicButtonSize();
    return Math.min(buttonSize * 0.6, 30);
  }

  // Métodos para ondas internas
  getInternalWaveSize(waveNumber: number): number {
    const sphereSize = this.getMainSphereSize();
    const baseSize = sphereSize * 0.3;
    const increment = waveNumber * (sphereSize * 0.1);
    return Math.min(
      baseSize + increment + this.audioLevel * 20,
      sphereSize * 0.8,
    );
  }

  getInternalWavePosition(waveNumber: number): { x: number; y: number } {
    const sphereSize = this.getMainSphereSize();
    const centerOffset = sphereSize / 2;
    const angle = waveNumber * 120 + this.audioLevel * 45;
    const radius = sphereSize * 0.15 + this.audioLevel * 15;

    return {
      x: Math.cos((angle * Math.PI) / 180) * radius,
      y: Math.sin((angle * Math.PI) / 180) * radius,
    };
  }

  getInternalCloudSize(cloudNumber: number): number {
    const sphereSize = this.getMainSphereSize();
    const baseSize = sphereSize * 0.15 + cloudNumber * (sphereSize * 0.05);
    return baseSize + this.audioLevel * 15;
  }

  getInternalCloudPosition(cloudNumber: number): { x: number; y: number } {
    const sphereSize = this.getMainSphereSize();
    const angle = cloudNumber * 180 + this.audioLevel * 60;
    const radius = sphereSize * 0.2 + this.audioLevel * 10;

    return {
      x: Math.cos((angle * Math.PI) / 180) * radius,
      y: Math.sin((angle * Math.PI) / 180) * radius,
    };
  }

  // Método para resetear la configuración a valores por defecto
  resetAdvancedSettings() {
    this.inactivityTimeout = 30;
    this.maxCallDuration = 300;
    this.agentSpeed = 0;
    this.llmTemperature = 0;
    this.isRecordingNoticeEnabled = false;
  }

  // Método para obtener un resumen de la configuración
  getAdvancedSettingsSummary(): string {
    return `Tiempo de inactividad: ${this.getFormattedInactivityTimeout()}, Duración máxima: ${this.getFormattedMaxCallDuration()}, Aviso de grabación: ${this.isRecordingNoticeEnabled ? 'Activado' : 'Desactivado'}`;
  }

  // Formatea número a decimal con coma (ej: 18 → '0,18')
  formatDecimal(value: number): string {
    // Limitamos a 200 para no exceder 2,00
    const clamped = Math.min(value, 200);
    const realValue = clamped / 100; // 18 → 0.18, 134 → 1.34
    return realValue.toFixed(2).replace('.', ',');
  }

  // Métodos para detectar cambios en los sliders
  onInactivityChange() {
    // Puedes agregar lógica si necesitas más adelante
  }

  onMaxCallDurationChange() {}

  // Métodos para efectos del video del mar
  getVideoFilter(): string {
    const brightness = 1 + this.audioLevel * 0.6;
    const contrast = 1 + this.audioLevel * 0.4;
    const saturation = 1 + this.audioLevel * 0.8;

    return `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${this.audioLevel * 1.2}px)`;
  }

  getVideoTransform(): string {
    const scale = 1 + this.audioLevel * 0.2;
    const rotation = this.audioLevel * 15; // Rotación más pronunciada

    return `scale(${scale}) rotate(${rotation}deg)`;
  }

  getVideoOpacity(): number {
    return 0.7 + this.audioLevel * 0.3;
  }

  getAudioOverlay(): string {
    if (this.audioLevel < 0.1) return 'transparent';

    const intensity = this.audioLevel * 0.6;
    return `radial-gradient(circle, rgba(59, 130, 246, ${intensity}) 0%, transparent 70%)`;
  }

  getAudioGlow(): string {
    if (this.audioLevel < 0.1) return 'none';

    const intensity = this.audioLevel * 50;
    return `0 0 ${intensity}px rgba(59, 130, 246, 0.8), inset 0 0 ${intensity}px rgba(59, 130, 246, 0.5)`;
  }

  getSeaGradient(): string {
    const intensity = 1 + this.audioLevel * 0.6;
    return `radial-gradient(circle at center, 
     rgba(59, 130, 246, ${0.9 * intensity}) 0%, 
     rgba(147, 197, 253, ${0.7 * intensity}) 30%, 
     rgba(255, 255, 255, ${0.5 * intensity}) 60%, 
     rgba(30, 64, 175, ${0.8 * intensity}) 100%)`;
  }

  // Métodos para el modal de generar prompt
  toggleGeneratePromptDropdown() {
    if (this.showGeneratePromptModal || this.isGeneratePromptDropdownClosing) {
      this.closeGeneratePromptModal();
    } else {
      this.openGeneratePromptModal();
    }
  }

  openGeneratePromptModal() {
    this.isGeneratePromptDropdownClosing = false;
    this.showGeneratePromptModal = true;
    this.promptEnterpriseName =
      (this.userStore.user()?.enterprise?.name || '').trim() || 'Mi Empresa';
  }

  closeGeneratePromptModal() {
    if (this.isGeneratingPrompt) return;
    this.isGeneratePromptDropdownClosing = true;
    setTimeout(() => {
      this.showGeneratePromptModal = false;
      this.isGeneratePromptDropdownClosing = false;
      this.promptDescription = '';
      this.isGeneratingPrompt = false;
      this.generatePromptError = '';
    }, 160);
  }

  private normalizeLanguageCode(code: string): string {
    const normalized = (code || '').trim().toLowerCase();
    if (normalized === 'us') return 'en';
    if (normalized === 'se') return 'sv';
    if (normalized.length === 2) return normalized;
    return 'es';
  }

  generatePrompt() {
    if (this.isGeneratingPrompt) return;

    const userDescription = (this.promptDescription || '').trim();
    if (!userDescription) {
      this.generatePromptError =
        'Escribe una descripción para generar el prompt.';
      return;
    }

    const voiceId =
      this.selectedVoiceId ||
      this.voices?.[this.currentVoiceIndex]?.voiceId ||
      this.voices?.[this.currentVoiceIndex]?.id ||
      '';

    const enterpriseName = this.promptEnterpriseName.trim() || 'Mi Empresa';

    const payload: GenerateAgentInstructionsRequest = {
      enterpriseName,
      agentName: (this.agentName || '').trim() || 'Agente',
      callType: this.selectedCallType || 'inbound',
      language: this.normalizeLanguageCode(this.selectedCountry || 'es'),
      voiceId,
      voiceParameters: {
        stability: this.voiceParameters.stability,
        similarity: this.voiceParameters.similarity,
        style: this.voiceParameters.style,
        boost: this.voiceParameters.boost,
        speed: this.voiceParameters.speed,
      },
      userDescription,
      ...(this.shopifyConnectedDomain
        ? { shopDomain: this.shopifyConnectedDomain }
        : {}),
    };

    this.isGeneratingPrompt = true;
    this.generatePromptError = '';

    this.agentsService.generateAgentInstructions(payload).subscribe({
      next: (res) => {
        const instruction = (res?.agentInstruction || '').trim();
        if (!instruction) {
          this.generatePromptError =
            'No se pudo generar el prompt. Inténtalo de nuevo.';
          this.isGeneratingPrompt = false;
          return;
        }
        this.instructions = instruction;
        this.isGeneratingPrompt = false;
        this.closeGeneratePromptModal();
      },
      error: (err) => {
        this.isGeneratingPrompt = false;
        this.generatePromptError =
          err?.error?.message ||
          err?.message ||
          'Error al generar el prompt. Inténtalo de nuevo.';
      },
    });
  }

  onSkipConnectPhone() {
    this.setStep('final');
    this.saveDraft();
  }

  // Método para obtener el número de paso actual
  getCurrentStepNumber(): number {
    if (this.isOutboundAgentFlow) {
      if (this.skipShopifyBusinessStep) {
        const locked: Record<string, number> = {
          agentName: 1,
          language: 2,
          voices: 3,
        };
        return locked[this.step] ?? 0;
      }
      const outbound: Record<string, number> = {
        agentName: 1,
        language: 2,
        voices: 3,
        connectBusiness: 4,
        campaign: 5,
        instructions: 6,
        importCsv: 7,
        segmentation: 8,
        scheduleCampaign: 9,
      };
      return outbound[this.step] ?? 0;
    }

    const skip = this.skipShopifyBusinessStep;
    const withSkip: Record<string, number> = {
      agentName: 1,
      language: 2,
      voices: 3,
      instructions: 4,
      knowledgeBase: 5,
      summary: 6,
      connectPhone: 7,
    };
    const full: Record<string, number> = {
      agentName: 1,
      language: 2,
      voices: 3,
      connectBusiness: 4,
      instructions: 5,
      knowledgeBase: 6,
      summary: 7,
      connectPhone: 8,
    };
    const stepOrder = skip ? withSkip : full;
    return stepOrder[this.step] ?? 0;
  }

  // Método para obtener el total de pasos
  getTotalSteps(): number {
    if (this.isOutboundAgentFlow) {
      return this.skipShopifyBusinessStep ? 3 : 9;
    }
    return this.skipShopifyBusinessStep ? 7 : 8;
  }

  private setStep(
    nextStep:
      | 'agentName'
      | 'language'
      | 'voices'
      | 'campaign'
      | 'importCsv'
      | 'segmentation'
      | 'scheduleCampaign'
      | 'connectBusiness'
      | 'instructions'
      | 'knowledgeBase'
      | 'summary'
      | 'connectPhone'
      | 'advancedSettings'
      | 'final'
      | 'success',
  ) {
    if (this.step === nextStep && this.displayedStep === nextStep) {
      return;
    }

    this.step = nextStep;

    if (this.displayedStep === nextStep) {
      this.isStepFadingOut = false;
      return;
    }

    this.isStepFadingOut = true;
    if (this.stepFadeTimeout) {
      clearTimeout(this.stepFadeTimeout);
    }
    this.stepFadeTimeout = setTimeout(() => {
      this.displayedStep = nextStep;
      this.isStepFadingOut = false;
      this.stepFadeTimeout = null;
    }, 250);
  }
}
