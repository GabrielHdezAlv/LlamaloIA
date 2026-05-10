import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { I18nService } from '../../core/services/i18n.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import {
  AgentsService,
  GenerateAgentInstructionsRequest,
} from '../../core/services/agents.service';
import { KnowledgeBaseService } from '../../core/services/knowledge-base.service';
import { UserService } from '../../core/services/user.service';
import { ModalService } from '../../shared/modals/modal.service';
import {
  Agent,
  OutboundQueueLead,
  SetAgentConfigDto,
} from '../../shared/models/agent.model';
import { environment } from '../../../environments/environment';
import { Voice } from '../../shared/models/voice.model';
import {
  KnowledgeSource,
  CreateKnowledgeSourceRequest,
  LinkKnowledgeSourcesToAgentRequest,
} from '../../shared/models/knowledge-source.model';
import { AiSphereComponent } from '../../shared/components/ai-sphere/ai-sphere.component';
import { KnowledgeEmptyStateIconComponent } from '../../shared/components/knowledge-empty-state-icon/knowledge-empty-state-icon.component';
import {
  VoiceTestService,
  VoiceTestConfig,
  TranscriptMessage,
} from '../../core/services/voice-test.service';
import { TwilioService } from '../../core/services/twilio.service';
import { getApiErrorMessage } from '../../core/utils/api-error-message';
import type {
  TwilioAccount,
  TwilioConfig,
} from '../../shared/models/twilio-config.model';
import type { UserProfileResponseDto } from '../../shared/models/user-profile-response.dto';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  Subject,
  takeUntil,
  mergeMap,
  catchError,
  of,
} from 'rxjs';
import { UserStorage } from '../../storages/user/user-storage';
import {
  resolveEffectivePlanSlug,
  isShopifyIntegrationLockedForPlan,
} from '../../shared/utils/shopify-plan-lock.util';
import {
  WebhookActionsService,
  type WebhookAction,
} from '../../core/services/webhook-actions.service';
import { CampaignStepComponent } from '../new-create-agents/steps/campaign-step/campaign-step.component';
import {
  InstructionsStepComponent,
  type OutboundCampaignScripts,
  type OutboundCampaignKind,
} from '../new-create-agents/steps/instructions-step/instructions-step.component';
import { ImportCsvStepComponent } from '../new-create-agents/steps/import-csv-step/import-csv-step.component';
import { SegmentationStepComponent } from '../new-create-agents/steps/segmentation-step/segmentation-step.component';
import { ScheduleCampaignStepComponent } from '../new-create-agents/steps/schedule-campaign-step/schedule-campaign-step.component';

const DEFAULT_OUTBOUND_EDIT_SCRIPTS: OutboundCampaignScripts = {
  abandonedCart: '',
  satisfactionSurvey: '',
  postPurchase: '',
  paymentReminder: '',
  customCsv: '',
  customMake: '',
};

@Component({
  selector: 'app-edit-agent',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AiSphereComponent,
    KnowledgeEmptyStateIconComponent,
    CampaignStepComponent,
    InstructionsStepComponent,
    ImportCsvStepComponent,
    SegmentationStepComponent,
    ScheduleCampaignStepComponent,
  ],
  templateUrl: './edit-agent.component.html',
  styleUrls: ['./edit-agent.component.scss'],
})
export class EditAgentComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private agentsService = inject(AgentsService);
  private knowledgeBaseService = inject(KnowledgeBaseService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private platformId = inject(PLATFORM_ID);
  private twilioService = inject(TwilioService);
  private userStore = inject(UserStorage);
  private cdr = inject(ChangeDetectorRef);
  private notificationService = inject(NotificationService);
  private i18nService = inject(I18nService);
  private webhookActionsService = inject(WebhookActionsService);
  readonly voiceTest = inject(VoiceTestService);

  editForm!: FormGroup;
  isLoading = false;
  voices: Voice[] = [];
  
  // Parámetros por defecto según la voz
  private getVoiceDefaultParams(voiceName: string) {
    if (voiceName.includes('Carlos')) {
      return { stability: 0.85, similarity: 0.85, style: 0.85, speed: 1.05, boost: true };
    } else if (voiceName.includes('María') || voiceName.includes('Maria')) {
      return { stability: 0.45, similarity: 0.85, style: 0.40, speed: 1.05, boost: true };
    } else if (voiceName.includes('Carla')) {
      return { stability: 1.0, similarity: 0.70, style: 0.40, speed: 1.15, boost: false };
    } else if (voiceName.includes('David')) {
      return { stability: 0.70, similarity: 0.70, style: 0.70, speed: 1.15, boost: true };
    } else if (voiceName.includes('Jesús') || voiceName.includes('Jesus')) {
      return { stability: 1.0, similarity: 0.70, style: 0.30, speed: 1.15, boost: false };
    } else if (voiceName.includes('Claudia')) {
      return { stability: 1.0, similarity: 0.80, style: 0.20, speed: 1.15, boost: true };
    } else {
      return null;
    }
  }
  languages: any[] = [];
  agent: Agent | null = null;
  agentId: number | null = null;

  /** Estado editable de campaña saliente (solo UI; `agent.type === 'outbound'`). */
  outboundEditCampaignKind: OutboundCampaignKind | null = null;
  outboundEditScripts: OutboundCampaignScripts = {
    ...DEFAULT_OUTBOUND_EDIT_SCRIPTS,
  };
  outboundEditPhones: string[] = [];
  outboundEditQueueLeads: OutboundQueueLead[] | undefined = undefined;
  outboundEditSegmentationNotes = '';
  outboundEditScheduleNotes = '';

  get isOutboundAgent(): boolean {
    return this.agent?.type === 'outbound';
  }

  /** Solo campañas Shopify tienen paso de segmentación en edición. */
  get outboundEditShowsSegmentation(): boolean {
    const k = this.outboundEditCampaignKind;
    if (!k) return true;
    return (
      k === 'satisfactionSurvey' ||
      k === 'abandonedCart' ||
      k === 'paymentReminder' ||
      k === 'postPurchase'
    );
  }

  /** Importar CSV no aplica a campaña Make. */
  get outboundEditShowsCsvContacts(): boolean {
    return this.outboundEditCampaignKind !== 'customMake';
  }

  /** Entrada HTTP (Make) hacia el backend. */
  get outboundMakeIngressUrl(): string {
    if (!this.isOutboundAgent || this.outboundEditCampaignKind !== 'customMake') {
      return '';
    }
    return `${environment.apiUrl.replace(/\/+$/, '')}/webhooks/outbound/leads`;
  }

  get outboundMakeIngressSecret(): string {
    return (this.agent?.outboundIngressSecret ?? '').trim();
  }

  activeTab: 'main' | 'connections' | 'knowledge' = 'main';
  isTabTransitioning = false;
  private readonly TAB_SWITCH_DELAY_MS = 120;
  private readonly TAB_ENTER_DELAY_MS = 35;
  private tabSwitchTimeout: ReturnType<typeof setTimeout> | null = null;
  private tabEnterTimeout: ReturnType<typeof setTimeout> | null = null;

  // Secciones desplegables del tab "Principal" (cada una independiente)
  nameSectionOpen = true;
  greetingSectionOpen = false;
  systemSectionOpen = true;
  twilioSectionOpen = false;
  callSectionOpen = true;
  voiceSectionOpen = false;

  outboundCsvSectionOpen = false;
  outboundSegmentationSectionOpen = false;
  outboundScheduleSectionOpen = false;

  /** Listas desplegables custom (Idioma / Voz) en Prueba de agente — evita el select nativo a ancho completo */
  voiceTestLangOpen = false;
  voiceTestVoiceOpen = false;

  agentKnowledgeSources: KnowledgeSource[] = [];
  isLoadingKnowledgeSources = false;
  availableKnowledgeSources: KnowledgeSource[] = [];
  isLoadingAvailableSources = false;
  knowledgeSourceError: string | null = null;

  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef<HTMLInputElement>;

  @ViewChild('transcriptContainer')
  transcriptContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('expandedSystemMessageTa')
  expandedSystemMessageTa?: ElementRef<HTMLTextAreaElement>;

  twilioAccounts: TwilioAccount[] = [];
  isLoadingTwilioInfo = false;

  /** Twilio inline (mismo bloque que en new-create-agents / connect-phone-step; sin modal) */
  showTwilioConfig = false;
  loadingTwilioAccountsPanel = false;
  isTwilioValidated = false;
  isValidatingTwilio = false;
  twilioSidValidationStatus: 'success' | 'error' | null = null;
  twilioTokenValidationStatus: 'success' | 'error' | null = null;
  twilioErrorMessage = '';
  /** Cuenta seleccionada o validada en el panel (antes de asignar al agente) */
  twilioPanelSelectedAccount: TwilioAccount | null = null;
  showNewTwilioAccountForm = false;
  twilioSid = '';
  twilioToken = '';
  isSavingTwilioConfig = false;
  twilioAssignError: string | null = null;

  /** Números importados en Twilio disponibles para asignar (mismo criterio que crear agente, excl. otros agentes). */
  availablePhoneNumbers: Array<{
    phoneId: number;
    countryCode: string;
    number: string;
    state?: 'Activo' | 'Inactivo';
    importedBy?: string;
    twilioAccountId?: number;
  }> = [];
  loadingPhoneNumbers = false;

  shopifyStores: string[] = [];
  isLoadingShopifyStores = false;
  selectedShopifyDomain = '';
  isSavingShopifyDomain = false;

  /** Número de acciones Make (webhooks) del agente; se actualiza al abrir Conexiones y al cerrar el panel. */
  makeWebhookActionsCount: number | null = null;
  makeWebhookCountLoading = false;

  /** Sidebar Make (mismo patrón deslizante que el paso Instrucciones en creación de agente) */
  showMakeEditSidebar = false;
  isMakeEditSidebarClosing = false;
  makeSidebarSavedActions: WebhookAction[] = [];
  makeSidebarLoading = false;
  makeSidebarSaving = false;
  makeSidebarSaveError: string | null = null;
  makeSidebarForm: { name: string; description: string; serverUrl: string } = {
    name: '',
    description: '',
    serverUrl: '',
  };

  /** Modal detalle / edición acción Make (vista 4xl compacta del listado) */
  makeActionDetailForModal: WebhookAction | null = null;
  makeActionDetailEditForm: { name: string; description: string; serverUrl: string } =
    { name: '', description: '', serverUrl: '' };
  makeActionDetailSaving = false;
  makeActionDetailSaveError: string | null = null;

  // Audio
  audioLevel = 0;
  isPlaying = false;
  private voiceTestAnimationFrame: number | null = null;
  currentPlayingVoice: string | null = null;
  audioActual: HTMLAudioElement | null = null;
  private animationId: any;
  private readonly VOCES_LANG_CODES: readonly string[] = [
    'es',
    'en',
    'it',
    'de',
    'fr',
  ];
  // Caché de audios para precarga y reproducción rápida
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  // Propiedades para el selector de país
  showCountryMenu = false;
  selectedCountryCode = '+34';
  selectedCountry = 'es';

  // Propiedades para el selector de idioma
  showLanguageMenu = false;
  selectedLanguageCode = 'es';
  selectedLanguageFlag = 'es';

  // Propiedades para validación de teléfono
  isValidatingPhone = false;
  phoneValidationMessage = '';
  phoneIsValid: boolean | null = null;
  private phoneValidationSubject = new Subject<{
    countryCode: string;
    number: string;
    timestamp: number;
  }>();
  private destroy$ = new Subject<void>();

  private isBrowser: boolean;

  // Desplegable de generar prompt con IA (mismo patrón que crear agente)
  showGeneratePromptModal = false;
  isGeneratePromptDropdownClosing = false;
  promptDescription = '';
  promptEnterpriseName = '';
  isGeneratingPrompt = false;
  generatePromptError = '';

  /** Modal de mensaje del sistema a pantalla completa (mismo patrón que instrucciones en creación). */
  showExpandSystemMessageModal = false;
  isSystemMessageModalClosing = false;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      language: ['', Validators.required],
      type: ['', Validators.required],
      voiceId: ['', Validators.required],
      firstInteraction: ['', Validators.required],
      agentInstruction: [''], // Opcional, puede estar vacío
      countryCode: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      label: [''],
      state: ['', Validators.required],
      stability: [
        0.5,
        [Validators.required, Validators.min(0), Validators.max(1)],
      ],
      similarity: [
        0.75,
        [Validators.required, Validators.min(0), Validators.max(1)],
      ],
      style: [0.0, [Validators.required, Validators.min(0), Validators.max(1)]],
      boost: [false],
      speed: [
        1.0,
        [Validators.required, Validators.min(0.25), Validators.max(4)],
      ],
    });
  }

  setActiveMainSection(
    section:
      | 'name'
      | 'greeting'
      | 'system'
      | 'twilio'
      | 'call'
      | 'voice'
      | 'outboundCsv'
      | 'outboundSegmentation'
      | 'outboundSchedule',
  ): void {
    switch (section) {
      case 'name':
        this.nameSectionOpen = !this.nameSectionOpen;
        break;
      case 'greeting':
        this.greetingSectionOpen = !this.greetingSectionOpen;
        break;
      case 'system':
        this.systemSectionOpen = !this.systemSectionOpen;
        break;
      case 'twilio':
        this.twilioSectionOpen = !this.twilioSectionOpen;
        if (!this.twilioSectionOpen) {
          this.showTwilioConfig = false;
        }
        break;
      case 'call':
        this.callSectionOpen = !this.callSectionOpen;
        break;
      case 'voice':
        this.voiceSectionOpen = !this.voiceSectionOpen;
        break;
      case 'outboundCsv':
        this.outboundCsvSectionOpen = !this.outboundCsvSectionOpen;
        break;
      case 'outboundSegmentation':
        this.outboundSegmentationSectionOpen =
          !this.outboundSegmentationSectionOpen;
        break;
      case 'outboundSchedule':
        this.outboundScheduleSectionOpen = !this.outboundScheduleSectionOpen;
        break;
    }
  }

  ngOnInit(): void {
    // Leer query params para ver si venimos de conectar Shopify o si hay un tab específico
    this.route.queryParams.subscribe((params) => {
      if (params['tab']) {
        const tab = params['tab'];
        if (tab === 'main' || tab === 'connections' || tab === 'knowledge') {
          this.setActiveTab(tab);
        }
      }
    });

    // Obtener agentId de la ruta
    const agentIdParam = this.route.snapshot.paramMap.get('agentId');
    if (agentIdParam) {
      this.agentId = parseInt(agentIdParam, 10);
      this.loadAgent();
    } else {
      this.navigateToAgentsWithError(
        'Error',
        'No se pudo identificar el agente.',
      );
      return;
    }

    this.loadTwilioInfo();

    this.loadShopifyStores();

    // Cargar voces
    this.agentsService.getVoices().subscribe({
      next: (voices) => {
        this.voices = voices;
        // Precargar audio cuando las voces estén cargadas y haya valores en el formulario
        setTimeout(() => this.preloadAudio(), 100);
      },
      error: (error) => {
        console.error('Error al cargar voces:', error);
      },
    });

    // Precargar audio cuando cambia la voz y detener reproducción si está activa
    this.editForm.get('voiceId')?.valueChanges.subscribe(() => {
      if (this.isPlaying) {
        this.pauseTestAudio();
      }
      this.preloadAudio();
    });

    // Cargar idiomas (mismos que en Crear Agente)
    this.userService.getLanguages().subscribe({
      next: (languages) => {
        // Filtrar solo los idiomas que están en Crear Agente
        const availableLanguageCodes = [
          'es',
          'en',
          'fr',
          'it',
          'de',
          'pt',
          'us',
          'tr',
          'se',
          'nl',
        ];
        this.languages = languages.filter((lang: any) =>
          availableLanguageCodes.includes(lang.code),
        );

        // Si no hay idiomas del API o faltan algunos, usar la lista completa
        if (this.languages.length === 0) {
          this.languages = [
            { code: 'es', name: 'Español' },
            { code: 'en', name: 'Inglés Británico' },
            { code: 'fr', name: 'Francés' },
            { code: 'it', name: 'Italiano' },
            { code: 'de', name: 'Alemán' },
            { code: 'pt', name: 'Portugués' },
            { code: 'us', name: 'Inglés Americano' },
            { code: 'tr', name: 'Turco' },
            { code: 'se', name: 'Sueco' },
            { code: 'nl', name: 'Danés' },
          ];
        } else {
          // Asegurar que todos los idiomas de Crear Agente estén presentes
          const languageMap = new Map(
            this.languages.map((lang: any) => [lang.code, lang]),
          );
          const defaultLanguages = [
            { code: 'es', name: 'Español' },
            { code: 'en', name: 'Inglés Británico' },
            { code: 'fr', name: 'Francés' },
            { code: 'it', name: 'Italiano' },
            { code: 'de', name: 'Alemán' },
            { code: 'pt', name: 'Portugués' },
            { code: 'us', name: 'Inglés Americano' },
            { code: 'tr', name: 'Turco' },
            { code: 'se', name: 'Sueco' },
            { code: 'nl', name: 'Danés' },
          ];

          // Combinar idiomas del API con los por defecto, priorizando el API
          this.languages = availableLanguageCodes.map((code) => {
            return (
              languageMap.get(code) ||
              defaultLanguages.find((d) => d.code === code) || {
                code,
                name: code,
              }
            );
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar idiomas:', error);
        // Usar lista completa de idiomas de Crear Agente como fallback
        this.languages = [
          { code: 'es', name: 'Español' },
          { code: 'en', name: 'Inglés Británico' },
          { code: 'fr', name: 'Francés' },
          { code: 'it', name: 'Italiano' },
          { code: 'de', name: 'Alemán' },
          { code: 'pt', name: 'Portugués' },
          { code: 'us', name: 'Inglés Americano' },
          { code: 'tr', name: 'Turco' },
          { code: 'se', name: 'Sueco' },
          { code: 'nl', name: 'Danés' },
        ];
      },
    });

    // Iniciar animación idle de la esfera
    if (this.isBrowser) {
      this.animateIdle();
    }

    // Configurar validación automática del teléfono
    this.setupPhoneValidation();
  }

  private loadShopifyStores(): void {
    this.isLoadingShopifyStores = true;
    this.userService
      .getUserProfile()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al cargar tiendas Shopify:', error);
          return of(null as UserProfileResponseDto | null);
        }),
      )
      .subscribe((profile) => {
        this.isLoadingShopifyStores = false;
        const stores = profile?.integrations?.shopify;
        if (stores && Array.isArray(stores)) {
          this.shopifyStores = stores
            .filter((s) => s?.connected === true && !!s?.shopDomain)
            .map((s) => String(s!.shopDomain));
        } else {
          this.shopifyStores = [];
        }
      });
  }

  setActiveTab(tab: 'main' | 'connections' | 'knowledge'): void {
    if (tab === this.activeTab && !this.isTabTransitioning) {
      this.runTabSideEffects(tab);
      return;
    }

    if (this.tabSwitchTimeout) {
      clearTimeout(this.tabSwitchTimeout);
      this.tabSwitchTimeout = null;
    }
    if (this.tabEnterTimeout) {
      clearTimeout(this.tabEnterTimeout);
      this.tabEnterTimeout = null;
    }

    this.isTabTransitioning = true;

    this.tabSwitchTimeout = setTimeout(() => {
      this.activeTab = tab;
      this.runTabSideEffects(tab);
      this.cdr.markForCheck();

      this.tabEnterTimeout = setTimeout(() => {
        this.isTabTransitioning = false;
        this.cdr.markForCheck();
        this.tabEnterTimeout = null;
      }, this.TAB_ENTER_DELAY_MS);

      this.tabSwitchTimeout = null;
    }, this.TAB_SWITCH_DELAY_MS);
  }

  private runTabSideEffects(tab: 'main' | 'connections' | 'knowledge'): void {
    if (tab === 'connections') {
      this.refreshMakeWebhookActionsCount();
    }

    if (tab === 'knowledge') {
      this.loadAvailableKnowledgeSources();
    }
  }

  /** Cuenta acciones vía GET /agents/:id/webhook-actions (mismo listado que el modal). */
  refreshMakeWebhookActionsCount(): void {
    if (!this.agentId) {
      this.makeWebhookActionsCount = null;
      return;
    }
    this.makeWebhookCountLoading = true;
    this.webhookActionsService
      .list(this.agentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.makeWebhookActionsCount = res.items.length;
          this.makeWebhookCountLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.makeWebhookActionsCount = null;
          this.makeWebhookCountLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  get agentShopifyDomain(): string | null {
    return this.agent?.shopifyDomain ?? null;
  }

  /** Gratis / Starter: Shopify bloqueado en UI (Growth+ en API). */
  get shopifyIntegrationLocked(): boolean {
    const slug = resolveEffectivePlanSlug(this.userStore.user());
    return isShopifyIntegrationLockedForPlan(slug);
  }

  openShopifyLockedUpgradePlan(): void {
    this.modalService.openUpgradePlan();
  }

  get agentTwilioAccountId(): number | null {
    if (!this.agent) return null;
    const anyAgent = this.agent as any;
    const direct = anyAgent?.twilioAccountId;
    if (typeof direct === 'number') return direct;
    const phoneLevel = anyAgent?.phoneNumbers?.twilioAccountId;
    if (typeof phoneLevel === 'number') return phoneLevel;
    return null;
  }

  get agentTwilioAccount(): TwilioAccount | null {
    const id = this.agentTwilioAccountId;
    if (id == null) return null;
    return this.twilioAccounts.find((a) => a.twilioAccountId === id) || null;
  }

  toggleTwilioInlineConfig(event?: Event): void {
    event?.stopPropagation();
    this.showTwilioConfig = !this.showTwilioConfig;
    if (this.showTwilioConfig) {
      this.prepareTwilioPanel();
    }
  }

  /**
   * Compatibilidad: enlaces antiguos o caché de plantilla que aún llaman al modal eliminado.
   * Abre el acordeón Twilio si hace falta y despliega el panel inline (mismo flujo que Conectar).
   */
  openTwilioModal(): void {
    if (!this.twilioSectionOpen) {
      this.twilioSectionOpen = true;
    }
    if (!this.showTwilioConfig) {
      this.showTwilioConfig = true;
      this.prepareTwilioPanel();
    }
  }

  prepareTwilioPanel(): void {
    this.loadingTwilioAccountsPanel = true;
    this.loadTwilioInfo(() => {
      this.loadingTwilioAccountsPanel = false;
      this.showNewTwilioAccountForm = this.twilioAccounts.length === 0;
    });
  }

  onTwilioSidInputEdit(value: string): void {
    this.twilioSid = value;
    this.twilioSidValidationStatus = null;
    this.twilioTokenValidationStatus = null;
    this.twilioErrorMessage = '';
    this.isTwilioValidated = false;
    this.twilioAssignError = null;
  }

  onTwilioTokenInputEdit(value: string): void {
    this.twilioToken = value;
    this.twilioSidValidationStatus = null;
    this.twilioTokenValidationStatus = null;
    this.twilioErrorMessage = '';
    this.isTwilioValidated = false;
    this.twilioAssignError = null;
  }

  useExistingTwilioAccountForPanel(account: TwilioAccount): void {
    this.twilioPanelSelectedAccount = account;
    this.twilioSid = account.twilioSid;
    this.twilioToken = account.twilioToken;
    this.showNewTwilioAccountForm = false;
    this.twilioAssignError = null;
    this.validateTwilioConfigInline();
  }

  showNewTwilioAccountForPanel(): void {
    this.twilioPanelSelectedAccount = null;
    this.twilioSid = '';
    this.twilioToken = '';
    this.showNewTwilioAccountForm = true;
    this.showTwilioConfig = true;
    this.twilioSidValidationStatus = null;
    this.twilioTokenValidationStatus = null;
    this.isTwilioValidated = false;
    this.twilioErrorMessage = '';
    this.twilioAssignError = null;
    this.availablePhoneNumbers = [];
    this.loadingPhoneNumbers = false;
  }

  backToTwilioAccountSelection(): void {
    this.showNewTwilioAccountForm = false;
    this.twilioPanelSelectedAccount = null;
    this.twilioSid = '';
    this.twilioToken = '';
    this.twilioSidValidationStatus = null;
    this.twilioTokenValidationStatus = null;
    this.isTwilioValidated = false;
    this.twilioErrorMessage = '';
    this.twilioAssignError = null;
    this.availablePhoneNumbers = [];
    this.loadingPhoneNumbers = false;
  }

  validateTwilioConfigInline(): void {
    if (!this.twilioSid?.trim() || !this.twilioToken?.trim()) {
      this.notificationService.error(
        'Completa Account SID y Auth Token antes de validar.',
      );
      return;
    }

    this.twilioErrorMessage = '';
    this.twilioSidValidationStatus = null;
    this.twilioTokenValidationStatus = null;
    this.twilioAssignError = null;
    this.isValidatingTwilio = true;

    const config: {
      twilioSid: string;
      twilioToken: string;
      twilioAccountId?: number;
    } = {
      twilioSid: this.twilioSid.trim(),
      twilioToken: this.twilioToken.trim(),
    };
    if (this.twilioPanelSelectedAccount) {
      config.twilioAccountId = this.twilioPanelSelectedAccount.twilioAccountId;
    }

    this.twilioService
      .setConfig(config)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: () => {
        this.isValidatingTwilio = false;
        this.twilioSidValidationStatus = 'success';
        this.twilioTokenValidationStatus = 'success';
        this.isTwilioValidated = true;
        this.loadTwilioInfo(() => this.resolveTwilioAccountAfterValidation());
      },
      error: (error: unknown) => {
        this.isValidatingTwilio = false;
        this.twilioSidValidationStatus = 'error';
        this.twilioTokenValidationStatus = 'error';
        this.isTwilioValidated = false;
        const defaultMsg =
          'Error al validar Twilio. Revisa Account SID y Auth Token.';
        const err = error as { status?: number };
        let msg = getApiErrorMessage(error, defaultMsg);
        if (msg === defaultMsg && err?.status === 401) {
          msg =
            'Credenciales inválidas. Verifica Account SID y Auth Token.';
        }
        this.twilioErrorMessage = msg;
      },
    });
  }

  /**
   * Tras validar credenciales Twilio: fija la cuenta en panel y carga números importados
   * para elegir o escribir uno (no asigna al agente hasta "Asignar número al agente").
   */
  private resolveTwilioAccountAfterValidation(): void {
    const applyAccount = (acc: TwilioAccount | null): void => {
      if (!acc?.twilioAccountId) {
        return;
      }
      this.twilioPanelSelectedAccount = acc;
      this.loadAvailablePhoneNumbersForTwilioPanel();
    };

    if (this.twilioPanelSelectedAccount?.twilioAccountId != null) {
      applyAccount(this.twilioPanelSelectedAccount);
      return;
    }

    this.userService
      .getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          const list = profile.twilio || [];
          const sid = this.twilioSid.trim();
          const token = this.twilioToken.trim();
          let match = list.find(
            (a) => a.twilioSid === sid && a.twilioToken === token,
          );
          if (!match) {
            match = list.find((a) => a.twilioSid === sid);
          }
          if (match) {
            applyAccount(match);
            return;
          }
          const fromLoaded = this.twilioAccounts.find((a) => a.twilioSid === sid);
          if (fromLoaded) {
            applyAccount(fromLoaded);
          } else {
            this.notificationService.error(
              'Cuenta validada pero no se encontró el ID. Recarga e inténtalo de nuevo.',
            );
          }
        },
        error: () => {
          const sid = this.twilioSid.trim();
          const fromLoaded = this.twilioAccounts.find((a) => a.twilioSid === sid);
          if (fromLoaded) {
            applyAccount(fromLoaded);
          } else {
            this.notificationService.error(
              'No se pudo obtener el perfil para completar la selección de cuenta.',
            );
          }
        },
      });
  }

  private loadAvailablePhoneNumbersForTwilioPanel(): void {
    if (!this.twilioPanelSelectedAccount) {
      this.availablePhoneNumbers = [];
      return;
    }
    this.loadingPhoneNumbers = true;
    this.userService
      .getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.loadingPhoneNumbers = false;
          const allPhoneNumbers = profile.phoneNumbers || [];
          const usedByOtherAgents = new Set<string>();
          if (profile.agents && Array.isArray(profile.agents)) {
            profile.agents.forEach((agentRow: any) => {
              const aid = agentRow?.agentId as number | undefined;
              if (aid != null && aid === this.agentId) {
                return;
              }
              const pn = agentRow?.phoneNumbers as
                | { countryCode: string; number: string | number }
                | undefined;
              if (
                pn?.countryCode != null &&
                pn.number != null &&
                String(pn.number).length > 0
              ) {
                usedByOtherAgents.add(`${pn.countryCode}${pn.number}`);
              }
            });
          }
          const accId = this.twilioPanelSelectedAccount!.twilioAccountId;
          this.availablePhoneNumbers = allPhoneNumbers.filter((phone) => {
            if (phone.twilioAccountId !== accId) {
              return false;
            }
            const key = `${phone.countryCode}${phone.number}`;
            return !usedByOtherAgents.has(key);
          });
          setTimeout(() => this.validatePhoneNumber(), 0);
        },
        error: () => {
          this.loadingPhoneNumbers = false;
          this.availablePhoneNumbers = [];
        },
      });
  }

  onTwilioPanelSelectImportedPhone(phone: {
    countryCode: string;
    number: string | number;
  }): void {
    const cc = phone.countryCode.startsWith('+')
      ? phone.countryCode
      : `+${phone.countryCode}`;
    const numStr = String(phone.number).replace(/\D/g, '');
    this.selectedCountryCode = cc;
    this.editForm.patchValue({
      countryCode: cc,
      phoneNumber: numStr,
    });
    this.validatePhoneNumber();
  }

  onTwilioPhoneCountryChange(): void {
    const v = this.editForm.get('countryCode')?.value;
    this.selectedCountryCode =
      typeof v === 'string' && v.startsWith('+') ? v : '+34';
    this.validatePhoneNumber();
  }

  /** Listo para confirmar cuenta + número en el agente (tras validar Twilio y el número). */
  isPhoneReadyForTwilioAssign(): boolean {
    const raw = this.editForm.get('phoneNumber')?.value;
    const digits = raw ? String(raw).replace(/\D/g, '') : '';
    if (!digits) {
      return false;
    }
    return this.phoneIsValid === true;
  }

  private resetTwilioPanelAfterAssign(): void {
    this.showTwilioConfig = false;
    this.showNewTwilioAccountForm = false;
    this.isTwilioValidated = false;
    this.twilioPanelSelectedAccount = null;
    this.twilioSid = '';
    this.twilioToken = '';
    this.twilioSidValidationStatus = null;
    this.twilioTokenValidationStatus = null;
    this.twilioErrorMessage = '';
    this.twilioAssignError = null;
    this.availablePhoneNumbers = [];
    this.loadingPhoneNumbers = false;
  }

  assignTwilioAccountToAgent(twilioAccountId: number | null): void {
    if (!this.agentId) return;
    if (twilioAccountId == null || Number.isNaN(Number(twilioAccountId))) {
      this.notificationService.error('Selecciona una cuenta de Twilio válida.');
      return;
    }
    if (!this.editForm.valid) {
      this.notificationService.error(
        'Revisa los campos del agente antes de asignar Twilio.',
      );
      return;
    }

    if (this.isOutboundAgent && !this.outboundEditCampaignKind) {
      this.notificationService.error(
        'Selecciona el tipo de campaña antes de asignar Twilio.',
      );
      return;
    }

    const formValue = this.editForm.value;
    const newCountryCode = this.selectedCountryCode;
    const newNumberDigits = formValue.phoneNumber
      ? String(formValue.phoneNumber).replace(/\D/g, '')
      : '';

    const updateData: SetAgentConfigDto = {
      name: String(formValue.name || '').trim(),
      language: formValue.language,
      type: formValue.type,
      twilioAccountId: Number(twilioAccountId ?? 0),
      voiceId: formValue.voiceId,
      firstInteraction: this.resolveFirstInteractionForPayload(formValue),
      agentInstruction: String(formValue.agentInstruction || '').trim(),
      phoneNumbers: {
        countryCode: newCountryCode,
        number: parseInt(newNumberDigits || '0', 10),
      },
      label: String(formValue.label || '').trim(),
      state: formValue.state,
      parameters: {
        stability: formValue.stability,
        similarity: formValue.similarity,
        style: formValue.style,
        boost: formValue.boost,
        speed: formValue.speed,
      },
      ...(this.isOutboundAgent ? this.outboundExtrasForPayload() : {}),
    };

    this.isSavingTwilioConfig = true;
    this.twilioAssignError = null;
    this.agentsService.updateAgent(this.agentId, updateData).subscribe({
      next: (response) => {
        this.isSavingTwilioConfig = false;
        this.agent = response.agent;
        const anyAgent = this.agent as any;
        anyAgent.twilioAccountId = Number(twilioAccountId ?? 0);
        this.notificationService.success(
          'La cuenta de Twilio del agente se actualizó correctamente.',
        );
        this.resetTwilioPanelAfterAssign();
      },
      error: (error) => {
        console.error('❌ Error al actualizar Twilio del agente:', error);
        this.isSavingTwilioConfig = false;
        this.twilioAssignError =
          'No se pudo asignar la cuenta a este agente. Reintenta.';
        this.notificationService.error(
          'No se pudo actualizar la cuenta de Twilio del agente.',
        );
      },
    });
  }

  private loadTwilioInfo(onComplete?: () => void): void {
    this.isLoadingTwilioInfo = true;
    this.twilioService
      .getInfo()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al cargar Twilio info:', error);
          return of(null as TwilioConfig | null);
        }),
      )
      .subscribe((config) => {
        this.isLoadingTwilioInfo = false;
        this.twilioAccounts = config?.accounts || [];
        onComplete?.();
      });
  }

  ngOnDestroy(): void {
    if (this.tabSwitchTimeout) {
      clearTimeout(this.tabSwitchTimeout);
      this.tabSwitchTimeout = null;
    }
    if (this.tabEnterTimeout) {
      clearTimeout(this.tabEnterTimeout);
      this.tabEnterTimeout = null;
    }

    if (this.audioActual) {
      this.audioActual.pause();
      this.audioActual = null;
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    // Limpiar caché de audios
    this.audioCache.forEach((audio) => {
      audio.pause();
      audio.src = '';
    });
    this.audioCache.clear();

    // Limpiar voice test local sin cortar una posible sesión global de soporte (Xenon)
    this.voiceTest.resetIfNotSupportChat();

    // Limpiar suscripciones
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAgent(): void {
    if (!this.agentId) return;

    this.agentsService.getAgentsList().subscribe({
      next: (response) => {
        const agent = response.agents.find(
          (a) =>
            (a.agentId && a.agentId === this.agentId) ||
            a.phoneNumbers?.phoneId === this.agentId,
        );

        if (!agent) {
          this.navigateToAgentsWithError('Error', 'Agente no encontrado.');
          return;
        }

        this.agent = agent;
        
        // No sobrescribir selectedShopifyDomain si venimos de un éxito de conexión
        const queryParams = this.route.snapshot.queryParams;
        if (queryParams['shopify'] === 'success' && queryParams['shop']) {
          this.selectedShopifyDomain = queryParams['shop'];
          // Auto-guardar
          setTimeout(() => this.saveShopifyDomain(), 500);
        } else {
          this.selectedShopifyDomain = (agent as any)?.shopifyDomain || '';
        }
        
        this.populateForm();

        // Subscribirse a cambios en voiceId para actualizar parámetros si el usuario cambia la voz
        this.editForm.get('voiceId')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(newVoiceId => {
          if (newVoiceId) {
            const voice = this.voices.find(v => v.voiceId === newVoiceId);
            if (voice) {
              const defaultParams = this.getVoiceDefaultParams(voice.name);
              if (defaultParams) {
                this.editForm.patchValue(defaultParams);
              }
            }
          }
        });

        // Cargar fuentes de conocimiento del agente
        this.loadAgentKnowledgeSources();
      },
      error: (error) => {
        console.error('Error al cargar agente:', error);
        this.navigateToAgentsWithError(
          'Error',
          'No se pudo cargar la información del agente.',
        );
      },
    });
  }

  private loadAgentKnowledgeSources(): void {
    if (!this.agentId) return;

    this.isLoadingKnowledgeSources = true;

    this.knowledgeBaseService.getAgentKnowledgeSources(this.agentId).subscribe({
      next: (response) => {
        // La respuesta puede venir directamente como array o como objeto con propiedad knowledgeSources
        const knowledgeSources = Array.isArray(response)
          ? response
          : response?.knowledgeSources || [];
        const sourceIds = knowledgeSources.map((source) => source.id);

        // Normalizar fechas para evitar errores con el pipe date
        this.agentKnowledgeSources = knowledgeSources.map((source: any) => ({
          ...source,
          createdAt: this.toDate(source.createdAt),
          updatedAt: this.toDate(source.updatedAt),
        }));
      },
      error: (error) => {
        console.error(
          '❌ Error al cargar fuentes de conocimiento del agente:',
          error,
        );
        this.agentKnowledgeSources = [];
      },
      complete: () => {
        this.isLoadingKnowledgeSources = false;
      },
    });
  }

  /**
   * Normaliza distintos formatos de fecha (Date, string, timestamp con seconds, etc.)
   * a una instancia de Date válida para usar con el pipe date.
   */
  private toDate(value: any): Date {
    if (!value) {
      return new Date();
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }

    if (typeof value === 'object') {
      const seconds = (value as any).seconds ?? (value as any)._seconds;
      if (typeof seconds === 'number') {
        return new Date(seconds * 1000);
      }
    }

    return new Date();
  }

  private populateForm(): void {
    if (!this.agent) return;

    const agentLanguage = this.agent.language || 'es';

    this.editForm.patchValue(
      {
        name: this.agent.name || '',
        language: agentLanguage, // Agregar campo language con valor por defecto
        type: this.agent.type || 'inbound',
        voiceId: this.agent.voiceId || '',
        firstInteraction: this.agent.firstInteraction || '',
        agentInstruction: this.agent.agentInstruction || '',
        countryCode: this.agent.phoneNumbers?.countryCode || '+34',
        phoneNumber: this.agent.phoneNumbers?.number != null
          ? String(this.agent.phoneNumbers.number)
          : '',
        label: this.agent.label || '',
        state: this.agent.state || 'Activo',
      },
      { emitEvent: false },
    ); // No emitir eventos al poblar el formulario para evitar validaciones innecesarias

    // Extraemos los parámetros con default fallback
    let params = this.agent.parameters || {};
    
    // Si el agente no tiene parámetros guardados (o le faltan) pero tiene un voiceId
    if (this.agent.voiceId && (params.stability === undefined || params.similarity === undefined)) {
      // Buscar el nombre de la voz correspondiente
      const voice = this.voices.find(v => v.voiceId === this.agent?.voiceId);
      if (voice) {
        const defaultParams = this.getVoiceDefaultParams(voice.name);
        if (defaultParams) {
          params = { ...defaultParams, ...params }; // Mezclar respetando los guardados si existieran
        }
      }
    }
    
    this.editForm.patchValue({
      stability: params.stability ?? 0.5,
      similarity: params.similarity ?? 0.75,
      style: params.style ?? 0.0,
      boost: params.boost ?? false,
      speed: params.speed ?? 1.0,
    });

    this.selectedCountryCode =
      this.agent.phoneNumbers?.countryCode || '+34';

    // Establecer las variables de idioma seleccionado
    this.selectedLanguageCode = agentLanguage;
    this.selectedLanguageFlag = this.getLanguageFlag(agentLanguage);

    if (this.agent.type === 'outbound') {
      this.initOutboundEditFromAgent();
      this.editForm.get('firstInteraction')?.clearValidators();
    } else {
      this.outboundEditCampaignKind = null;
      this.outboundEditScripts = { ...DEFAULT_OUTBOUND_EDIT_SCRIPTS };
      this.outboundEditPhones = [];
      this.outboundEditQueueLeads = undefined;
      this.outboundEditSegmentationNotes = '';
      this.outboundEditScheduleNotes = '';
      this.editForm
        .get('firstInteraction')
        ?.setValidators([Validators.required]);
    }
    this.editForm
      .get('firstInteraction')
      ?.updateValueAndValidity({ emitEvent: false });

    // Precargar el audio después de poblar el formulario
    setTimeout(() => this.preloadAudio(), 200);
  }

  private readonly outboundKindOrder: OutboundCampaignKind[] = [
    'satisfactionSurvey',
    'abandonedCart',
    'paymentReminder',
    'postPurchase',
    'customCsv',
    'customMake',
  ];

  private outboundExtrasForPayload(): Pick<
    SetAgentConfigDto,
    | 'outboundCampaignKind'
    | 'outboundCampaignScripts'
    | 'outboundImportCsvPhones'
    | 'outboundQueueLeads'
    | 'outboundSegmentationNotes'
    | 'outboundScheduleCampaignNotes'
  > {
    return {
      outboundCampaignKind: this.outboundEditCampaignKind ?? undefined,
      outboundCampaignScripts: { ...this.outboundEditScripts },
      outboundImportCsvPhones: [...this.outboundEditPhones],
      ...(this.outboundEditQueueLeads?.length
        ? { outboundQueueLeads: [...this.outboundEditQueueLeads] }
        : {}),
      outboundSegmentationNotes: this.outboundEditSegmentationNotes ?? '',
      outboundScheduleCampaignNotes: this.outboundEditScheduleNotes ?? '',
    };
  }

  private initOutboundEditFromAgent(): void {
    if (!this.agent || this.agent.type !== 'outbound') {
      return;
    }
    const rawKind = this.agent.outboundCampaignKind;
    const normalizedKind =
      rawKind === 'customCsvMake' ? 'customCsv' : rawKind;
    this.outboundEditCampaignKind =
      normalizedKind &&
      this.outboundKindOrder.includes(normalizedKind as OutboundCampaignKind)
        ? (normalizedKind as OutboundCampaignKind)
        : null;
    this.outboundEditPhones = [...(this.agent.outboundImportCsvPhones ?? [])];
    this.outboundEditQueueLeads =
      this.agent.outboundQueueLeads &&
      Array.isArray(this.agent.outboundQueueLeads)
        ? [...this.agent.outboundQueueLeads]
        : undefined;
    this.outboundEditSegmentationNotes =
      this.agent.outboundSegmentationNotes ?? '';
    this.outboundEditScheduleNotes =
      this.agent.outboundScheduleCampaignNotes ?? '';
    const scripts = (this.agent.outboundCampaignScripts ?? {}) as Record<
      string,
      string | undefined
    >;
    this.outboundEditScripts = {
      ...DEFAULT_OUTBOUND_EDIT_SCRIPTS,
      ...scripts,
    };
    if (scripts['customCsvMake'] && !this.outboundEditScripts.customCsv) {
      this.outboundEditScripts = {
        ...this.outboundEditScripts,
        customCsv: scripts['customCsvMake'] ?? '',
      };
    }
    this.syncOutboundFirstInteractionFromScripts();
  }

  private syncOutboundFirstInteractionFromScripts(): void {
    if (!this.outboundEditCampaignKind) {
      return;
    }
    const text =
      this.outboundEditScripts[this.outboundEditCampaignKind] ?? '';
    this.editForm.patchValue({ firstInteraction: text }, { emitEvent: false });
  }

  onOutboundEditCampaignChange(kind: OutboundCampaignKind | null): void {
    this.outboundEditCampaignKind = kind;
    this.syncOutboundFirstInteractionFromScripts();
  }

  onOutboundEditScriptsChange(scripts: OutboundCampaignScripts): void {
    this.outboundEditScripts = { ...scripts };
    this.syncOutboundFirstInteractionFromScripts();
  }

  onOutboundEditPhonesChange(phones: string[]): void {
    this.outboundEditPhones = [...phones];
  }

  onOutboundEditQueueLeadsChange(leads: OutboundQueueLead[] | undefined): void {
    this.outboundEditQueueLeads = leads;
  }

  onOutboundEditSegmentationNotesChange(notes: string): void {
    this.outboundEditSegmentationNotes = notes;
  }

  onOutboundEditScheduleNotesChange(notes: string): void {
    this.outboundEditScheduleNotes = notes;
  }

  private resolveFirstInteractionForPayload(formValue: {
    firstInteraction?: string;
  }): string {
    if (!this.isOutboundAgent) {
      return String(formValue.firstInteraction || '').trim();
    }
    const kind = this.outboundEditCampaignKind;
    if (!kind) {
      return '';
    }
    return String(this.outboundEditScripts[kind] ?? '').trim();
  }

  getCountryFromCode(code: string): string {
    const codeMap: Record<string, string> = {
      '+34': 'es',
      '+1': 'us',
      '+33': 'fr',
      '+49': 'de',
    };
    return codeMap[code] || 'es';
  }

  toggleCountryMenu() {
    this.showCountryMenu = !this.showCountryMenu;
  }

  selectCountry(countryCode: string, code: string) {
    this.selectedCountryCode = code;
    this.selectedCountry = countryCode;
    this.showCountryMenu = false;
    this.editForm.patchValue({ countryCode: code });
    // Validar teléfono cuando cambia el prefijo
    this.validatePhoneNumber();
  }

  getLanguageFlag(languageCode: string): string {
    // Mapeo de códigos de idioma a códigos de país para las banderas (mismos que en Crear Agente)
    const languageToFlagMap: Record<string, string> = {
      es: 'es', // Español
      en: 'gb', // Inglés Británico
      fr: 'fr', // Francés
      it: 'it', // Italiano
      de: 'de', // Alemán
      pt: 'pt', // Portugués
      us: 'us', // Inglés Americano
      tr: 'tr', // Turco
      se: 'se', // Sueco
      nl: 'nl', // Holandés/Danés
    };
    return languageToFlagMap[languageCode] || 'es';
  }

  getLanguageName(languageCode: string): string {
    const lang = this.languages.find((l) => l.code === languageCode);
    return lang ? lang.name : 'Español';
  }

  toggleLanguageMenu() {
    this.showLanguageMenu = !this.showLanguageMenu;
  }

  toggleVoiceTestLangMenu(event: Event): void {
    event.stopPropagation();
    this.voiceTestVoiceOpen = false;
    this.voiceTestLangOpen = !this.voiceTestLangOpen;
  }

  toggleVoiceTestVoiceMenu(event: Event): void {
    event.stopPropagation();
    this.voiceTestLangOpen = false;
    this.voiceTestVoiceOpen = !this.voiceTestVoiceOpen;
  }

  pickVoiceTestLanguage(code: string): void {
    this.selectLanguage(code);
    this.voiceTestLangOpen = false;
  }

  pickVoiceTestVoice(voiceId: string): void {
    this.editForm.patchValue({ voiceId });
    this.voiceTestVoiceOpen = false;
  }

  getVoiceTestLanguageLabel(): string {
    const code = this.editForm.get('language')?.value;
    return code ? this.getLanguageName(code) : '—';
  }

  getVoiceTestVoiceLabel(): string {
    const id = this.editForm.get('voiceId')?.value;
    const v = this.voices.find((x) => x.voiceId === id);
    return v?.name ?? (id ? String(id) : '—');
  }

  isVoiceTestLanguageSelected(code: string): boolean {
    return this.editForm.get('language')?.value === code;
  }

  isVoiceTestVoiceSelected(voiceId: string): boolean {
    return this.editForm.get('voiceId')?.value === voiceId;
  }

  selectLanguage(languageCode: string) {
    this.selectedLanguageCode = languageCode;
    this.selectedLanguageFlag = this.getLanguageFlag(languageCode);
    this.showLanguageMenu = false;
    this.editForm.patchValue({ language: languageCode });
    // Detener reproducción si está activa al cambiar el idioma
    if (this.isPlaying) {
      this.pauseTestAudio();
    }
    // Precargar el audio cuando se cambia el idioma
    this.preloadAudio();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target) return;

    const dropdown =
      target.closest('[class*="w-28"]') || target.closest('[class*="w-32"]');
    const menu = target.closest('ul');
    const menuItem = target.closest('li');
    const languageDropdown = target.closest('[data-language-dropdown]');
    const iaGenerateRoot = target.closest('[data-ia-generate-root]');

    if (
      (this.showGeneratePromptModal || this.isGeneratePromptDropdownClosing) &&
      !iaGenerateRoot
    ) {
      this.closeGeneratePromptModal();
    }

    if (!dropdown && !menu && !menuItem && !languageDropdown) {
      this.showCountryMenu = false;
      this.showLanguageMenu = false;
    }

    if (!target.closest('[data-voice-test-lang-dropdown]')) {
      this.voiceTestLangOpen = false;
    }
    if (!target.closest('[data-voice-test-voice-dropdown]')) {
      this.voiceTestVoiceOpen = false;
    }
  }

  // Precargar el audio cuando cambia la voz o el idioma
  private preloadAudio(): void {
    const voiceId = this.editForm.get('voiceId')?.value;
    const language = this.editForm.get('language')?.value;

    if (!voiceId || !language) return;

    // Verificar si el idioma tiene audio disponible
    if (!this.VOCES_LANG_CODES.includes(language)) return;

    const selectedVoice = this.voices.find((v) => v.voiceId === voiceId);
    if (!selectedVoice) return;

    const voiceName = selectedVoice.name.toLowerCase();
    const lang = language;
    const cacheKey = `${voiceName}_${lang}`;
    const path = `assets/voces/${cacheKey}.mp3`;

    // Si ya está en caché, no hacer nada
    if (this.audioCache.has(cacheKey)) return;

    // Crear y precargar el audio en segundo plano
    const audio = new Audio(path);
    audio.preload = 'auto';

    // Cargar el audio sin reproducirlo
    audio.load();

    // Guardar en caché
    this.audioCache.set(cacheKey, audio);

    // Limpiar caché si hay más de 5 audios (para no consumir mucha memoria)
    if (this.audioCache.size > 5) {
      const firstKey = this.audioCache.keys().next().value;
      if (firstKey !== undefined) {
        const oldAudio = this.audioCache.get(firstKey);
        if (oldAudio && oldAudio !== this.audioActual) {
          oldAudio.pause();
          oldAudio.src = '';
        }
        this.audioCache.delete(firstKey);
      }
    }
  }

  // Reproducir audio de prueba
  playTestAudio(): void {
    const voiceId = this.editForm.get('voiceId')?.value;
    const language = this.editForm.get('language')?.value;

    if (!voiceId) {
      this.notificationService.error('Por favor, selecciona una voz primero.');
      return;
    }

    if (!language) {
      this.notificationService.error(
        'Por favor, selecciona un idioma primero.',
      );
      return;
    }

    // Buscar la voz por voiceId para obtener su nombre
    const selectedVoice = this.voices.find((v) => v.voiceId === voiceId);
    if (!selectedVoice) {
      this.notificationService.error('No se encontró la voz seleccionada.');
      return;
    }

    const voiceName = selectedVoice.name.toLowerCase();

    if (this.isPlaying && this.currentPlayingVoice === voiceId) {
      this.pauseTestAudio();
      return;
    }

    // Verificar si el idioma tiene audio disponible
    if (!this.VOCES_LANG_CODES.includes(language)) {
      this.navigateToAgentsWithError(
        'Error de audio',
        `No hay muestra de audio disponible para la voz "${selectedVoice.name}" en el idioma seleccionado.`,
      );
      return;
    }

    // Mapear el código de idioma al formato usado en assets/voces
    const lang = language;

    // Construir la clave de caché y la ruta
    const cacheKey = `${voiceName}_${lang}`;
    const path = `assets/voces/${cacheKey}.mp3`;

    if (this.audioActual) {
      this.audioActual.pause();
      this.audioActual.currentTime = 0;
    }

    // Intentar usar el audio del caché, si no existe, crear uno nuevo
    let audio = this.audioCache.get(cacheKey);

    if (!audio) {
      // Si no está en caché, crear uno nuevo y precargarlo
      audio = new Audio(path);
      audio.preload = 'auto';
      this.audioCache.set(cacheKey, audio);
    } else {
      // Si está en caché, reiniciar el tiempo de reproducción
      audio.currentTime = 0;
    }

    this.audioActual = audio;
    this.isPlaying = true;
    this.currentPlayingVoice = voiceId;

    // Animar la esfera mientras se reproduce
    this.animateAudioPlayback();

    // Intentar reproducir inmediatamente (si está precargado, será instantáneo)
    audio.play().catch((err) => {
      console.error('Error al reproducir audio:', err);
      this.isPlaying = false;
      this.currentPlayingVoice = null;
      this.audioLevel = 0;
      this.navigateToAgentsWithError(
        'Error de audio',
        'No se pudo reproducir el audio de prueba.',
      );
    });

    audio.onended = () => {
      this.isPlaying = false;
      this.currentPlayingVoice = null;
      this.audioLevel = 0;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      if (this.audioActual === audio) {
        this.audioActual = null;
      }
      this.animateIdle();
    };

    audio.onerror = () => {
      console.error('Error al cargar el audio:', path);
      this.isPlaying = false;
      this.currentPlayingVoice = null;
      this.audioLevel = 0;
      // Eliminar del caché si hay error
      this.audioCache.delete(cacheKey);
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      this.navigateToAgentsWithError(
        'Error de audio',
        `No hay muestra de audio disponible para la voz "${selectedVoice.name}" en el idioma seleccionado.`,
      );
      this.animateIdle();
    };
  }

  pauseTestAudio(): void {
    if (this.audioActual) {
      this.audioActual.pause();
      this.audioActual.currentTime = 0;
    }
    this.isPlaying = false;
    this.currentPlayingVoice = null;
    this.audioLevel = 0;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.animateIdle();
  }

  private animateIdle(): void {
    if (!this.isBrowser) return;
    if (this.animationId) cancelAnimationFrame(this.animationId);

    const animate = () => {
      if (this.isPlaying) return;

      // Si hay una llamada de prueba activa, animar según estado del agente
      const connState = this.voiceTest.connectionState();
      if (connState === 'connecting' || connState === 'connected') {
        const agentState = this.voiceTest.agentState();
        if (agentState === 'speaking') {
          this.audioLevel = 0.3 + Math.sin(Date.now() / 150) * 0.25 + Math.sin(Date.now() / 80) * 0.15;
        } else if (agentState === 'thinking') {
          this.audioLevel = 0.15 + Math.sin(Date.now() / 600) * 0.1;
        } else {
          this.audioLevel = Math.sin(Date.now() / 1000) * 0.15 + 0.08;
        }
      } else {
        // Pulso sinusoidal suave (idle normal)
        this.audioLevel = Math.sin(Date.now() / 1000) * 0.2 + 0.1;
      }
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  private animateAudioPlayback(): void {
    if (!this.isBrowser) return;
    if (this.animationId) cancelAnimationFrame(this.animationId);

    const animate = () => {
      if (!this.isPlaying) return;
      // Simular nivel de audio durante la reproducción
      this.audioLevel = Math.sin(Date.now() / 200) * 0.5 + 0.5;
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  // ──────── Voice Test Call ────────

  startVoiceTestCall(): void {
    const formValue = this.editForm.value;
    const config: VoiceTestConfig = {
      agentInstruction: formValue.agentInstruction || '',
      firstInteraction: this.resolveFirstInteractionForPayload(formValue),
      language: formValue.language || 'es',
      name: formValue.name || 'Agente',
      voiceId: formValue.voiceId || '',
      parameters: {
        stability: formValue.stability ?? 0.5,
        similarity: formValue.similarity ?? 0.75,
        style: formValue.style ?? 0.0,
        boost: formValue.boost ?? false,
        speed: formValue.speed ?? 1.0,
      },
      ...(this.selectedShopifyDomain ? { shopifyDomain: this.selectedShopifyDomain } : {}),
    };

    // Pausar audio preview si está sonando
    if (this.isPlaying) {
      this.pauseTestAudio();
    }

    this.voiceTest.startSession(config);
  }

  endVoiceTestCall(): void {
    this.voiceTest.endSession();
  }

  toggleVoiceTestMute(): void {
    this.voiceTest.toggleMute();
  }

  restartVoiceTestCall(): void {
    this.voiceTest.reset();
    this.startVoiceTestCall();
  }

  get isVoiceTestCallActive(): boolean {
    const state = this.voiceTest.connectionState();
    return state === 'connecting' || state === 'connected';
  }

  get isVoiceTestCallEnded(): boolean {
    const state = this.voiceTest.connectionState();
    return state === 'ended' || state === 'error';
  }

  get isVoiceTestIdle(): boolean {
    return this.voiceTest.connectionState() === 'idle';
  }

  formatVoiceTestTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  getVoiceTestAgentStateText(): string {
    const t = this.t;
    switch (this.voiceTest.agentState()) {
      case 'thinking':
        return t.agentStateThinking;
      case 'speaking':
        return t.agentStateSpeaking;
      case 'done':
        return t.agentStateDone;
      default:
        return t.agentStateWaiting;
    }
  }

  getVoiceTestConnectionStateText(): string {
    const t = this.t;
    switch (this.voiceTest.connectionState()) {
      case 'connecting':
        return t.connectionConnecting;
      case 'connected':
        return t.connected;
      case 'error':
        return t.statusError;
      case 'ended':
        return t.connectionEnded;
      default:
        return '';
    }
  }



  scrollVoiceTestToBottom(): void {
    try {
      if (this.transcriptContainer?.nativeElement) {
        const el = this.transcriptContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    } catch { }
  }

  trackByTimestamp(_index: number, msg: TranscriptMessage): number {
    return msg.timestamp;
  }

  get phoneChanged(): boolean {
    const newCountryCode = this.selectedCountryCode;
    const newNumberDigits = this.editForm.value.phoneNumber
      ? this.editForm.value.phoneNumber.replace(/\D/g, '')
      : '';

    const originalCountryCode = this.agent?.phoneNumbers?.countryCode || null;
    const originalNumberDigits =
      this.agent?.phoneNumbers?.number != null
        ? String(this.agent.phoneNumbers.number)
        : null;

    // Si no hay teléfono original, solo considerar que ha cambiado si se ha ingresado uno nuevo
    if (!originalCountryCode && !originalNumberDigits) {
      return newNumberDigits.length > 0;
    }

    return (
      originalCountryCode !== newCountryCode ||
      originalNumberDigits !== newNumberDigits
    );
  }

  // Debug method to check form validation status
  getFormValidationStatus(): void {
    console.log('=== FORM VALIDATION DEBUG ===');
    console.log('editForm.valid:', this.editForm.valid);
    console.log('editForm.invalid:', this.editForm.invalid);
    console.log('editForm.errors:', this.editForm.errors);

    // Check each field
    Object.keys(this.editForm.controls).forEach((key) => {
      const control = this.editForm.get(key);
      console.log(`${key}:`, {
        value: control?.value,
        valid: control?.valid,
        invalid: control?.invalid,
        errors: control?.errors,
        touched: control?.touched,
        dirty: control?.dirty,
      });
    });

    console.log('phoneChanged:', this.phoneChanged);
    console.log('isValidatingPhone:', this.isValidatingPhone);
    console.log('phoneIsValid:', this.phoneIsValid);
    console.log('isLoading:', this.isLoading);
    console.log('==============================');
  }

  onSubmit(): void {
    if (this.editForm.valid && this.agentId) {
      if (this.isOutboundAgent && !this.outboundEditCampaignKind) {
        this.notificationService.error(
          'Selecciona el tipo de campaña antes de guardar.',
        );
        return;
      }

      // Verificar si el teléfono ha sido validado y es válido
      const newCountryCode = this.selectedCountryCode;
      const newNumberDigits = this.editForm.value.phoneNumber.replace(
        /\D/g,
        '',
      );

      const originalCountryCode = this.agent?.phoneNumbers?.countryCode || null;
      const originalNumberDigits =
        this.agent?.phoneNumbers?.number != null
          ? String(this.agent.phoneNumbers.number)
          : null;

      // Usar la misma lógica que el getter phoneChanged
      let phoneChanged = false;

      // Si no hay teléfono original, solo considerar que ha cambiado si se ha ingresado uno nuevo
      if (!originalCountryCode && !originalNumberDigits) {
        phoneChanged = newNumberDigits.length > 0;
      } else {
        phoneChanged =
          originalCountryCode !== newCountryCode ||
          originalNumberDigits !== newNumberDigits;
      }

      // Si el teléfono cambió, debe estar validado y ser válido
      if (phoneChanged) {
        // Si aún se está validando, no permitir guardar
        if (this.isValidatingPhone) {
          this.notificationService.error(
            'Por favor, espera a que termine la validación del número de teléfono.',
          );
          return;
        }

        // Si no es válido, no permitir guardar
        if (this.phoneIsValid === false) {
          this.notificationService.error(
            this.phoneValidationMessage ||
            'El número de teléfono no es válido.',
          );
          return;
        }

        // Si no se ha validado aún (es null), forzar validación antes de guardar
        if (this.phoneIsValid === null) {
          this.validatePhoneNumber();
          this.notificationService.error(
            'Espera a que se valide el número de teléfono.',
          );
          return;
        }

        // Solo permitir guardar si es válido
        if (this.phoneIsValid !== true) {
          this.notificationService.error(
            'El número de teléfono debe ser válido antes de guardar.',
          );
          return;
        }
      }

      const formValue = this.editForm.value;
      const updateData: SetAgentConfigDto = {
        name: formValue.name.trim(),
        language: formValue.language,
        type: formValue.type,
        twilioAccountId: Number((this.agent as any)?.twilioAccountId ?? 0),
        voiceId: formValue.voiceId,
        firstInteraction: this.resolveFirstInteractionForPayload(formValue),
        agentInstruction: formValue.agentInstruction?.trim() || '',
        phoneNumbers: {
          countryCode: newCountryCode,
          number: parseInt(newNumberDigits, 10),
        },
        label: formValue.label.trim(),
        state: formValue.state,
        parameters: {
          stability: formValue.stability,
          similarity: formValue.similarity,
          style: formValue.style,
          boost: formValue.boost,
          speed: formValue.speed,
        },
        ...(this.isOutboundAgent ? this.outboundExtrasForPayload() : {}),
      };

      const shopifyDomain = this.selectedShopifyDomain?.trim();
      if (shopifyDomain) {
        (updateData as any).shopifyDomain = shopifyDomain;
      } else {
        (updateData as any).shopifyDomain = null;
      }

      this.isLoading = true;
      this.agentsService.updateAgent(this.agentId!, updateData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.success(
            'El agente ha sido actualizado correctamente.',
          );
          this.router.navigate(['/dashboard/agents']);
        },
        error: (error) => {
          console.error('❌ Error al actualizar agente:', error);
          this.isLoading = false;

          let errorMessage =
            'Error al actualizar el agente. Por favor, intenta nuevamente.';

          if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.status === 401) {
            errorMessage =
              'No autorizado. Por favor, inicia sesión nuevamente.';
          } else if (error?.status === 404) {
            errorMessage = 'Agente no encontrado.';
          } else if (error?.status === 400) {
            errorMessage =
              'Error en los datos enviados. Por favor, verifica todos los campos.';
          }

          this.navigateToAgentsWithError(
            'Error al actualizar agente',
            errorMessage,
          );
        },
      });
    } else {
      Object.keys(this.editForm.controls).forEach((key) => {
        this.editForm.get(key)?.markAsTouched();
      });
    }
  }

  saveShopifyDomain(): void {
    if (!this.agentId) return;

    if (!this.editForm.valid) {
      this.notificationService.error(
        'Revisa los campos del agente antes de guardar la tienda.',
      );
      return;
    }

    if (this.isOutboundAgent && !this.outboundEditCampaignKind) {
      this.notificationService.error(
        'Selecciona el tipo de campaña antes de guardar.',
      );
      return;
    }

    const formValue = this.editForm.value;
    const newCountryCode = this.selectedCountryCode;
    const newNumberDigits = formValue.phoneNumber
      ? String(formValue.phoneNumber).replace(/\D/g, '')
      : '';

    const updateData: SetAgentConfigDto = {
      name: String(formValue.name || '').trim(),
      language: formValue.language,
      type: formValue.type,
      twilioAccountId: Number((this.agent as any)?.twilioAccountId ?? 0),
      voiceId: formValue.voiceId,
      firstInteraction: this.resolveFirstInteractionForPayload(formValue),
      agentInstruction: String(formValue.agentInstruction || '').trim(),
      phoneNumbers: {
        countryCode: newCountryCode,
        number: parseInt(newNumberDigits || '0', 10),
      },
      label: String(formValue.label || '').trim(),
      state: formValue.state,
      parameters: {
        stability: formValue.stability,
        similarity: formValue.similarity,
        style: formValue.style,
        boost: formValue.boost,
        speed: formValue.speed,
      },
      ...(this.isOutboundAgent ? this.outboundExtrasForPayload() : {}),
    };

    const shopifyDomain = this.selectedShopifyDomain?.trim();
    if (shopifyDomain) {
      (updateData as any).shopifyDomain = shopifyDomain;
    } else {
      (updateData as any).shopifyDomain = null;
    }

    this.isSavingShopifyDomain = true;
    this.agentsService.updateAgent(this.agentId, updateData).subscribe({
      next: (response) => {
        this.isSavingShopifyDomain = false;
        this.agent = response.agent;
        this.notificationService.success(
          'La tienda de Shopify del agente se actualizó correctamente.',
        );
      },
      error: (error) => {
        console.error('❌ Error al actualizar Shopify del agente:', error);
        this.isSavingShopifyDomain = false;
        this.notificationService.error(
          'No se pudo actualizar la tienda de Shopify del agente.',
        );
      },
    });
  }

  goToShopifyOnboarding(): void {
    if (this.shopifyIntegrationLocked) {
      this.modalService.openUpgradePlan();
      return;
    }
    if (this.agentId) {
      this.router.navigate(['/shopify-onboarding'], { queryParams: { agentId: this.agentId } });
    } else {
      this.router.navigate(['/shopify-onboarding']);
    }
  }

  /** Abre el panel lateral de acciones Make (webhooks), mismo diseño que en paso Instrucciones. */
  openMakeEditSidebar(): void {
    if (!this.agentId) {
      this.notificationService.error(
        'No se pudo identificar el agente. Recarga la página e inténtalo de nuevo.',
      );
      return;
    }
    this.showMakeEditSidebar = true;
    this.isMakeEditSidebarClosing = false;
    this.makeSidebarSaveError = null;
    this.loadMakeSidebarActions();
  }

  closeMakeEditSidebar(): void {
    if (!this.showMakeEditSidebar) {
      return;
    }
    this.makeActionDetailForModal = null;
    this.isMakeEditSidebarClosing = true;
    window.setTimeout(() => {
      this.showMakeEditSidebar = false;
      this.isMakeEditSidebarClosing = false;
      this.refreshMakeWebhookActionsCount();
    }, 280);
  }

  openMakeActionDetailModal(action: WebhookAction): void {
    this.makeActionDetailForModal = action;
    this.makeActionDetailEditForm = {
      name: action.name,
      description: action.description ?? '',
      serverUrl: action.webhookUrl,
    };
    this.makeActionDetailSaveError = null;
  }

  closeMakeActionDetailModal(): void {
    this.makeActionDetailForModal = null;
    this.makeActionDetailEditForm = { name: '', description: '', serverUrl: '' };
    this.makeActionDetailSaveError = null;
    this.makeActionDetailSaving = false;
  }

  isMakeActionDetailFormValid(): boolean {
    const n = this.makeActionDetailEditForm.name.trim();
    const u = this.makeActionDetailEditForm.serverUrl.trim();
    return n.length >= 2 && u.length >= 12;
  }

  saveMakeActionDetailModal(): void {
    if (this.agentId == null || this.makeActionDetailForModal == null) {
      return;
    }
    if (!this.isMakeActionDetailFormValid()) {
      return;
    }
    this.makeActionDetailSaving = true;
    this.makeActionDetailSaveError = null;
    const actionId = this.makeActionDetailForModal.id;
    this.webhookActionsService
      .update(this.agentId, actionId, {
        name: this.makeActionDetailEditForm.name.trim(),
        description: this.makeActionDetailEditForm.description.trim(),
        webhookUrl: this.makeActionDetailEditForm.serverUrl.trim(),
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.makeActionDetailSaving = false;
          this.notificationService.success('Acción actualizada');
          this.closeMakeActionDetailModal();
          this.loadMakeSidebarActions();
        },
        error: (err: { error?: { message?: string } }) => {
          this.makeActionDetailSaving = false;
          this.makeActionDetailSaveError =
            err?.error?.message ||
            'No se pudo guardar. Revisa la URL (HTTPS) y los límites de tu plan.';
        },
      });
  }

  private loadMakeSidebarActions(): void {
    if (this.agentId == null) {
      return;
    }
    this.makeSidebarLoading = true;
    this.makeSidebarSaveError = null;
    this.webhookActionsService
      .list(this.agentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.makeSidebarSavedActions = res.items;
          this.makeSidebarLoading = false;
        },
        error: (err: { error?: { message?: string } }) => {
          this.makeSidebarLoading = false;
          this.makeSidebarSaveError =
            err?.error?.message ||
            'No se pudieron cargar las acciones. Comprueba tu plan.';
        },
      });
  }

  isMakeSidebarFormValid(): boolean {
    const n = this.makeSidebarForm.name.trim();
    const u = this.makeSidebarForm.serverUrl.trim();
    return n.length >= 2 && u.length >= 12;
  }

  saveMakeSidebarAction(): void {
    if (this.agentId == null) {
      this.notificationService.error('No se pudo identificar el agente.');
      return;
    }
    if (!this.isMakeSidebarFormValid()) {
      return;
    }
    this.makeSidebarSaving = true;
    this.makeSidebarSaveError = null;
    this.webhookActionsService
      .create(this.agentId, {
        name: this.makeSidebarForm.name.trim(),
        description: this.makeSidebarForm.description.trim(),
        webhookUrl: this.makeSidebarForm.serverUrl.trim(),
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.makeSidebarSaving = false;
          this.notificationService.success('Acción guardada');
          this.makeSidebarForm = { name: '', description: '', serverUrl: '' };
          this.loadMakeSidebarActions();
        },
        error: (err: { error?: { message?: string } }) => {
          this.makeSidebarSaving = false;
          this.makeSidebarSaveError =
            err?.error?.message ||
            'No se pudo guardar. Revisa la URL (HTTPS) y los límites de tu plan.';
        },
      });
  }

  removeMakeSidebarAction(id: string, event: Event): void {
    event.preventDefault();
    if (this.agentId == null) {
      return;
    }
    this.webhookActionsService
      .delete(this.agentId, id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Acción eliminada');
          this.loadMakeSidebarActions();
        },
        error: (err: { error?: { message?: string } }) => {
          this.notificationService.error(
            err?.error?.message || 'No se pudo eliminar la acción.',
          );
        },
      });
  }

  unlinkShopify(): void {
    if (this.shopifyIntegrationLocked) return;
    if (!this.agentId || !this.agentShopifyDomain) return;

    this.modalService
      .openWarning({
        title: this.t.shopifyDisconnectConfirmTitle,
        message: this.t.shopifyDisconnectConfirmMessage.replace(
          '{{shop}}',
          this.agentShopifyDomain,
        ),
        confirmText: this.t.shopifyDisconnectConfirmAction,
        cancelText: this.t.cancel,
        showCancelButton: true,
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.selectedShopifyDomain = '';
          this.saveShopifyDomain();
        }
      });
  }

  goToTwilioConnections(): void {
    this.router.navigate(['/dashboard/account'], {
      queryParams: { tab: 'connections' },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/agents']);
  }

  incrementValue(fieldName: string, step: number, max: number): void {
    const control = this.editForm.get(fieldName);
    if (control) {
      const currentValue = parseFloat(control.value) || 0;
      const newValue = Math.min(currentValue + step, max);
      control.setValue(parseFloat(newValue.toFixed(2)));
    }
  }

  decrementValue(fieldName: string, step: number, min: number): void {
    const control = this.editForm.get(fieldName);
    if (control) {
      const currentValue = parseFloat(control.value) || 0;
      const newValue = Math.max(currentValue - step, min);
      control.setValue(parseFloat(newValue.toFixed(2)));
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.hasError('required')) {
      return this.t.editAgentFieldRequired;
    }
    if (field?.hasError('min')) {
      return `${this.t.editAgentFieldMin} ${field.errors?.['min'].min}`;
    }
    if (field?.hasError('max')) {
      return `${this.t.editAgentFieldMax} ${field.errors?.['max'].max}`;
    }
    return '';
  }

  /**
   * Navega a la pantalla de agentes mostrando allí el modal de error.
   */
  private navigateToAgentsWithError(title: string, message: string): void {
    this.router.navigate(['/dashboard/agents'], {
      state: {
        errorModal: {
          title,
          message,
        },
      },
    });
  }

  /**
   * Configura la validación automática del teléfono cuando cambia el número o el prefijo
   */
  private setupPhoneValidation(): void {
    // Listener para cambios en el número de teléfono
    this.editForm
      .get('phoneNumber')
      ?.valueChanges.pipe(
        debounceTime(800), // Esperar 800ms después de que el usuario deje de escribir
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.validatePhoneNumber();
      });

    // Listener para cambios en el código de país
    this.editForm
      .get('countryCode')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.validatePhoneNumber();
      });

    // Configurar el Subject para validación con debounce
    this.phoneValidationSubject
      .pipe(
        debounceTime(500),
        switchMap(({ countryCode, number }) => {
          this.isValidatingPhone = true;
          this.phoneIsValid = null;
          this.phoneValidationMessage = '';
          const twilioAid =
            this.twilioPanelSelectedAccount?.twilioAccountId ??
            this.agentTwilioAccountId ??
            undefined;
          return this.twilioService
            .validatePhone(countryCode, number, twilioAid)
            .pipe(
            catchError((error) => {
              // Manejar el error y devolver un observable que permita continuar
              console.error('❌ Error al validar teléfono:', error);
              this.isValidatingPhone = false;
              this.phoneIsValid = false;

              if (error?.error?.message) {
                this.phoneValidationMessage = error.error.message;
              } else {
                this.phoneValidationMessage =
                  'No se pudo validar el número de teléfono. Por favor, verifica que sea correcto.';
              }

              // Devolver un observable vacío para que el stream continúe
              return of(null);
            }),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response) => {
          if (response) {
            // Solo actualizar si hay una respuesta válida (no es un error)
            this.isValidatingPhone = false;
            this.phoneIsValid = true;
            this.phoneValidationMessage =
              response.message || 'Número de teléfono válido';
          }
        },
        error: (error) => {
          // Este error solo se ejecutaría si hay un error en el pipe principal
          console.error('❌ Error inesperado en validación:', error);
          this.isValidatingPhone = false;
        },
      });
  }

  /**
   * Valida el número de teléfono actual
   */
  private validatePhoneNumber(): void {
    const phoneNumber = this.editForm.get('phoneNumber')?.value || '';
    const countryCode = this.selectedCountryCode;

    // Solo validar si hay un número ingresado
    if (!phoneNumber || phoneNumber.trim() === '') {
      this.phoneIsValid = null;
      this.phoneValidationMessage = '';
      this.isValidatingPhone = false;
      return;
    }

    // Limpiar el número (solo dígitos)
    const numberDigits = phoneNumber.replace(/\D/g, '');

    // Solo validar si hay dígitos
    if (!numberDigits || numberDigits.length === 0) {
      this.phoneIsValid = null;
      this.phoneValidationMessage = '';
      this.isValidatingPhone = false;
      return;
    }

    // Comparar con el número original del agente
    const originalCountryCode = this.agent?.phoneNumbers?.countryCode || null;
    const originalNumberDigits =
      this.agent?.phoneNumbers?.number != null
        ? String(this.agent.phoneNumbers.number)
        : null;

    // Si no hay teléfono original, validar el nuevo número
    if (!originalCountryCode && !originalNumberDigits) {
      // Enviar al Subject para validación con debounce
      this.phoneValidationSubject.next({
        countryCode,
        number: numberDigits,
        timestamp: Date.now(),
      });
      return;
    }

    // Si el número es igual al original, marcarlo como válido sin hacer petición
    if (
      originalCountryCode &&
      originalNumberDigits &&
      originalCountryCode === countryCode &&
      originalNumberDigits === numberDigits
    ) {
      this.isValidatingPhone = false;
      this.phoneIsValid = true;
      this.phoneValidationMessage = '';
      return;
    }

    // Si el número es diferente, hacer la validación
    // Enviar al Subject para validación con debounce
    // Agregar timestamp para asegurar que cada validación sea única
    this.phoneValidationSubject.next({
      countryCode,
      number: numberDigits,
      timestamp: Date.now(),
    });
  }

  // Desplegable «Generar con IA»
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
    this.promptDescription = '';
    this.promptEnterpriseName =
      (this.userStore.user()?.enterprise?.name || '').trim() || 'Mi Empresa';
    this.isGeneratingPrompt = false;
    this.generatePromptError = '';
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

  get agentInstructionControl(): FormControl<string | null> {
    return this.editForm.get('agentInstruction') as FormControl<string | null>;
  }

  openExpandSystemMessageModal() {
    this.isSystemMessageModalClosing = false;
    this.showExpandSystemMessageModal = true;
  }

  onExpandedSystemMessageModelChange(value: string) {
    this.agentInstructionControl.setValue(value, { emitEvent: true });
  }

  closeExpandSystemMessageModal() {
    if (this.isSystemMessageModalClosing) return;
    const ta = this.expandedSystemMessageTa?.nativeElement;
    if (ta) {
      this.agentInstructionControl.setValue(ta.value, { emitEvent: true });
    }
    this.isSystemMessageModalClosing = true;
    setTimeout(() => {
      this.showExpandSystemMessageModal = false;
      this.isSystemMessageModalClosing = false;
    }, 150);
  }

  private normalizeLanguageCode(code: string): string {
    // Mapeo de códigos de idioma del frontend al formato esperado por el backend
    const codeMap: Record<string, string> = {
      es: 'es',
      en: 'en',
      fr: 'fr',
      it: 'it',
      de: 'de',
      pt: 'pt',
      us: 'en', // Inglés Americano -> 'en'
      tr: 'tr',
      se: 'sv', // Sueco -> 'sv'
      nl: 'nl', // Danés/Holandés -> 'nl'
    };
    return codeMap[code] || 'es';
  }

  generatePrompt() {
    if (this.isGeneratingPrompt) return;

    const userDescription = (this.promptDescription || '').trim();
    if (!userDescription) {
      this.generatePromptError =
        'Escribe una descripción para generar el prompt.';
      return;
    }

    // Obtener información del formulario
    const agentName = this.editForm.get('name')?.value || '';
    const language = this.editForm.get('language')?.value || 'es';
    const callType = this.editForm.get('type')?.value || 'inbound';
    const voiceId = this.editForm.get('voiceId')?.value || '';

    // Obtener parámetros de voz del formulario
    const voiceParameters = {
      stability: this.editForm.get('stability')?.value ?? 0.5,
      similarity: this.editForm.get('similarity')?.value ?? 0.75,
      style: this.editForm.get('style')?.value ?? 0.0,
      boost: this.editForm.get('boost')?.value ?? false,
      speed: this.editForm.get('speed')?.value ?? 1.0,
    };

    // Obtener nombre de la empresa
    const enterpriseName = this.promptEnterpriseName.trim() || 'Mi Empresa';

    const payload: GenerateAgentInstructionsRequest = {
      enterpriseName,
      agentName: agentName.trim() || 'Agente',
      callType: callType || 'inbound',
      language: this.normalizeLanguageCode(language),
      voiceId: voiceId || 'default', // Proporcionar un valor por defecto si no hay voz seleccionada
      voiceParameters,
      userDescription: userDescription,
      ...(this.selectedShopifyDomain
        ? { shopDomain: this.selectedShopifyDomain }
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
        // Actualizar el campo agentInstruction del formulario
        this.editForm.patchValue({ agentInstruction: instruction });
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

  // Knowledge Source Management Methods
  loadAvailableKnowledgeSources(): void {
    this.isLoadingAvailableSources = true;
    this.knowledgeSourceError = null;

    this.knowledgeBaseService.getKnowledgeSources().subscribe({
      next: (response) => {
        const sources = Array.isArray(response)
          ? response
          : response?.knowledgeSources || [];

        // Filter out sources that are already linked to this agent
        const agentSourceIds = this.agentKnowledgeSources.map((s) => s.id);
        this.availableKnowledgeSources = sources.filter(
          (source) => !agentSourceIds.includes(source.id),
        );

        this.isLoadingAvailableSources = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading available knowledge sources:', error);
        this.knowledgeSourceError =
          'No se pudieron cargar las fuentes disponibles';
        this.isLoadingAvailableSources = false;
        this.availableKnowledgeSources = [];
        this.cdr.detectChanges();
      },
    });
  }

  selectKnowledgeSource(type: 'pdf' | 'web' | 'text'): void {
    switch (type) {
      case 'pdf':
        this.openFileSelector();
        break;
      case 'web':
        this.openWebModal();
        break;
      case 'text':
        this.openTextModal();
        break;
    }
  }

  openFileSelector(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  handleFileSelection(event: any): void {
    const files = event.target.files as FileList;
    if (files.length > 0) {
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        this.knowledgeSourceError = this.t.pdfMaxError;
        return;
      }
      this.uploadPdfFiles(Array.from(files));
    }
  }

  uploadPdfFiles(files: File[]): void {
    files.forEach((file) => {
      if (file.type === 'application/pdf') {
        this.isLoadingKnowledgeSources = true;

        this.knowledgeBaseService
          .uploadPdfKnowledgeSource(
            file,
            file.name.replace('.pdf', ''),
            [],
            false,
          )
          .subscribe({
            next: (response) => {
              const sourceToAdd = response?.knowledgeSource || response;

              if (sourceToAdd) {
                this.addKnowledgeSourceToAgent(sourceToAdd);
              } else {
                this.knowledgeSourceError =
                  this.t.errorNoFileInfo;
              }

              this.isLoadingKnowledgeSources = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error uploading PDF:', err);
              if (err.error?.message) {
                this.knowledgeSourceError = err.error.message;
              } else if (err.status === 413) {
                this.knowledgeSourceError =
                  this.t.pdfMaxError;
              } else {
                this.knowledgeSourceError = `${this.t.errorUploadingFile} ${file.name}`;
              }
              this.isLoadingKnowledgeSources = false;
              this.cdr.detectChanges();
            },
          });
      }
    });
  }

  openWebModal(): void {
    const dialogRef = this.modalService.openWeb({
      title: this.t.addWebSourceTitle,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.url) {
        this.createWebSource(result.url, result.name || result.url);
      }
    });
  }

  openTextModal(): void {
    const dialogRef = this.modalService.openText({
      title: this.t.addTextTitle,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.content) {
        this.createTextSource(result.content, result.name || this.t.manualTextDefault);
      }
    });
  }

  createWebSource(url: string, name: string): void {
    if (url.length > 2048) {
      this.knowledgeSourceError = this.t.urlMaxError;
      return;
    }

    this.isLoadingKnowledgeSources = true;
    this.knowledgeBaseService
      .createWebKnowledgeSource(url, name, [], true)
      .subscribe({
        next: (response: any) => {
          if (response?.id) {
            this.addKnowledgeSourceToAgent(response);
          } else {
            this.knowledgeSourceError = this.t.errorServerResponse;
          }
          this.isLoadingKnowledgeSources = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error creating web source:', err);
          if (err.error?.message) {
            this.knowledgeSourceError = err.error.message;
          } else if (err.status === 413) {
            this.knowledgeSourceError =
              this.t.urlMaxError;
          } else if (err.status === 400) {
            this.knowledgeSourceError = this.t.knowledgeWebSourceInvalidUrl;
          } else {
            this.knowledgeSourceError = this.t.errorCreatingWeb;
          }
          this.isLoadingKnowledgeSources = false;
          this.cdr.detectChanges();
        },
      });
  }

  createTextSource(content: string, name: string): void {
    if (content.length > 50000) {
      this.knowledgeSourceError =
        this.t.textMaxError;
      return;
    }

    const request: CreateKnowledgeSourceRequest = {
      name,
      type: 'text',
      content,
      tags: [],
      isPublic: false,
    };

    this.isLoadingKnowledgeSources = true;
    this.knowledgeBaseService.createKnowledgeSource(request).subscribe({
      next: (response) => {
        const sourceToAdd = response?.knowledgeSource || response;

        if (sourceToAdd?.id) {
          this.addKnowledgeSourceToAgent(sourceToAdd);
        } else {
          this.knowledgeSourceError = this.t.errorServerResponse;
        }
        this.isLoadingKnowledgeSources = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating text source:', err);
        if (err.error?.message) {
          this.knowledgeSourceError = err.error.message;
        } else if (err.status === 413) {
          this.knowledgeSourceError =
            this.t.textMaxError;
        } else {
          this.knowledgeSourceError = this.t.knowledgeTextSourceError;
        }
        this.isLoadingKnowledgeSources = false;
        this.cdr.detectChanges();
      },
    });
  }

  addKnowledgeSourceToAgent(source: KnowledgeSource): void {
    if (!this.agentId) return;

    const request: LinkKnowledgeSourcesToAgentRequest = {
      sourceIds: [source.id],
    };

    this.knowledgeBaseService
      .linkKnowledgeSourcesToAgent(this.agentId, request)
      .subscribe({
        next: () => {
          // Add to agent's knowledge sources
          this.agentKnowledgeSources.push(source);

          // Remove from available sources if it exists there
          this.availableKnowledgeSources =
            this.availableKnowledgeSources.filter(
              (availableSource) => availableSource.id !== source.id,
            );

          this.knowledgeSourceError = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error linking knowledge source to agent:', err);
          this.knowledgeSourceError =
            this.t.knowledgeSourceLinkError;
        },
      });
  }

  removeKnowledgeSourceFromAgent(sourceId: string): void {
    if (!this.agentId) return;

    this.knowledgeBaseService
      .unlinkSourceFromAgent(this.agentId, sourceId)
      .subscribe({
        next: (response) => {
          // Handle both cases: response with message or empty response
          const message =
            response?.message || this.t.knowledgeSourceUnlinkedSuccess;
          console.info('Fuente desvinculada:', message);

          // Remove from agent's knowledge sources
          const removedSource = this.agentKnowledgeSources.find(
            (s) => s.id === sourceId,
          );
          this.agentKnowledgeSources = this.agentKnowledgeSources.filter(
            (source) => source.id !== sourceId,
          );

          // Add back to available sources if it was removed
          if (removedSource) {
            this.availableKnowledgeSources.push(removedSource);
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error unlinking knowledge source from agent:', err);

          // Handle specific error cases
          if (err.status === 404) {
            this.knowledgeSourceError =
              this.t.knowledgeSourceUnlinkNotLinkedError;
          } else if (err.status === 400) {
            this.knowledgeSourceError =
              this.t.knowledgeSourceUnlinkAgentError;
          } else {
            this.knowledgeSourceError =
              this.t.knowledgeSourceUnlinkConnectionError;
          }
        },
      });
  }

  clearKnowledgeSourceError(): void {
    this.knowledgeSourceError = null;
  }

  get t() {
    return this.i18nService.getTranslations();
  }

  canEditKnowledgeSource(source: KnowledgeSource): boolean {
    if (source.status !== 'completed') {
      return false;
    }
    if (source.type === 'text') {
      return !!source.hasDownloadableContent;
    }
    if (source.type === 'web') {
      return !!(source.originalUrl && source.originalUrl.trim());
    }
    return false;
  }

  editKnowledgeSource(source: KnowledgeSource): void {
    if (!this.canEditKnowledgeSource(source)) {
      return;
    }

    if (source.type === 'text') {
      this.knowledgeBaseService.downloadKnowledgeSource(source.id).subscribe({
        next: (blob) => {
          void blob.text().then((content) => {
            const dialogRef = this.modalService.openText({
              title: this.t.editKnowledgeSource,
              initialName: source.name,
              initialContent: content,
              sourceId: source.id,
            });
            dialogRef.afterClosed().subscribe((result: any) => {
              if (result?.content && result.sourceId) {
                this.patchKnowledgeSourceAfterEdit(result.sourceId, {
                  name: result.name,
                  content: result.content,
                  type: 'text',
                });
              }
            });
          });
        },
        error: (err) => {
          console.error('Error loading text for edit:', err);
          this.notificationService.error(this.t.errorDownloadingKnowledge);
        },
      });
      return;
    }

    if (source.type === 'web') {
      const dialogRef = this.modalService.openWeb({
        title: this.t.editKnowledgeSource,
        editSourceId: source.id,
        initialFullUrl: source.originalUrl,
        initialName: source.name,
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result?.sourceId && result.url) {
          if (result.url.length > 2048) {
            this.notificationService.error(this.t.urlMaxError);
            return;
          }
          this.patchKnowledgeSourceAfterEdit(result.sourceId, {
            name: result.name,
            url: result.url,
            type: 'web',
          });
        }
      });
    }
  }

  private patchKnowledgeSourceAfterEdit(
    id: string,
    body: Partial<CreateKnowledgeSourceRequest>,
  ): void {
    if (body.content != null && body.content.length > 50000) {
      this.notificationService.error(this.t.textMaxError);
      return;
    }
    if (body.url != null && body.url.length > 2048) {
      this.notificationService.error(this.t.urlMaxError);
      return;
    }
    this.isLoadingKnowledgeSources = true;
    this.knowledgeBaseService.updateKnowledgeSource(id, body).subscribe({
      next: (response) => {
        const updated = response?.knowledgeSource;
        if (updated?.id) {
          const previous = this.agentKnowledgeSources.find((x) => x.id === id);
          const merged: KnowledgeSource = {
            ...updated,
            createdAt: new Date(updated.createdAt),
            updatedAt: new Date(updated.updatedAt),
            hasDownloadableContent: !!(
              updated.hasDownloadableContent ?? previous?.hasDownloadableContent
            ),
            isPublic:
              updated.isPublic === 'true' || updated.isPublic === true,
          };
          this.agentKnowledgeSources = this.agentKnowledgeSources.map((s) =>
            s.id === id ? { ...s, ...merged } : s,
          );
          this.availableKnowledgeSources = this.availableKnowledgeSources.map(
            (s) => (s.id === id ? { ...s, ...merged } : s),
          );
        } else {
          this.loadAgentKnowledgeSources();
        }
        this.isLoadingKnowledgeSources = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating knowledge source:', err);
        this.notificationService.error(this.t.errorUpdatingKnowledge);
        this.isLoadingKnowledgeSources = false;
        this.cdr.detectChanges();
      },
    });
  }
}
