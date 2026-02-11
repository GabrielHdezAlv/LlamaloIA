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
import {
  FormBuilder,
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
import { Agent, SetAgentConfigDto } from '../../shared/models/agent.model';
import { Voice } from '../../shared/models/voice.model';
import {
  KnowledgeSource,
  CreateKnowledgeSourceRequest,
  LinkKnowledgeSourcesToAgentRequest,
} from '../../shared/models/knowledge-source.model';
import { AiSphereComponent } from '../../shared/components/ai-sphere/ai-sphere.component';
import { TwilioService } from '../../core/services/twilio.service';
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

@Component({
  selector: 'app-edit-agent',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AiSphereComponent],
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

  editForm!: FormGroup;
  isLoading = false;
  voices: Voice[] = [];
  languages: any[] = [];
  agent: Agent | null = null;
  agentId: number | null = null;

  activeTab: 'main' | 'connections' | 'knowledge' = 'main';

  agentKnowledgeSources: KnowledgeSource[] = [];
  isLoadingKnowledgeSources = false;
  availableKnowledgeSources: KnowledgeSource[] = [];
  isLoadingAvailableSources = false;
  knowledgeSourceError: string | null = null;

  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef<HTMLInputElement>;

  twilioAccounts: TwilioAccount[] = [];
  isLoadingTwilioInfo = false;

  showTwilioModal = false;
  twilioModalMode: 'existing' | 'new' = 'existing';
  selectedTwilioAccountId: number | null = null;
  twilioSid = '';
  twilioToken = '';
  isSavingTwilioConfig = false;

  shopifyStores: string[] = [];
  isLoadingShopifyStores = false;
  selectedShopifyDomain = '';
  isSavingShopifyDomain = false;

  // Audio
  audioLevel = 0;
  isPlaying = false;
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

  // Modal de generar prompt con IA
  showGeneratePromptModal = false;
  promptDescription = '';
  isGeneratingPrompt = false;
  generatePromptError = '';

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

  ngOnInit(): void {
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
    this.activeTab = tab;

    // Load available knowledge sources when switching to knowledge tab
    if (tab === 'knowledge') {
      this.loadAvailableKnowledgeSources();
    }
  }

  get agentShopifyDomain(): string | null {
    return this.agent?.shopifyDomain ?? null;
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

  openTwilioModal(): void {
    this.showTwilioModal = true;
    const existingId = this.agentTwilioAccountId;
    this.selectedTwilioAccountId = existingId ?? null;
    this.twilioModalMode = this.twilioAccounts.length > 0 ? 'existing' : 'new';
    this.twilioSid = '';
    this.twilioToken = '';
  }

  closeTwilioModal(): void {
    this.showTwilioModal = false;
    this.isSavingTwilioConfig = false;
  }

  setTwilioModalMode(mode: 'existing' | 'new'): void {
    this.twilioModalMode = mode;
  }

  private assignTwilioAccountToAgent(twilioAccountId: number | null): void {
    if (!this.agentId) return;
    if (!this.editForm.valid) {
      this.modalService.openError({
        title: 'No se puede guardar',
        message: 'Revisa los campos del agente antes de asignar Twilio.',
      });
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
      firstInteraction: String(formValue.firstInteraction || '').trim(),
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
    };

    this.isSavingTwilioConfig = true;
    this.agentsService.updateAgent(this.agentId, updateData).subscribe({
      next: (response) => {
        this.isSavingTwilioConfig = false;
        this.agent = response.agent;
        const anyAgent = this.agent as any;
        anyAgent.twilioAccountId = Number(twilioAccountId ?? 0);
        this.modalService.openSuccess({
          title: 'Twilio actualizado',
          message: 'La cuenta de Twilio del agente se actualizó correctamente.',
        });
        this.closeTwilioModal();
      },
      error: (error) => {
        console.error('❌ Error al actualizar Twilio del agente:', error);
        this.isSavingTwilioConfig = false;
        const anyAgent = this.agent as any;
        if (anyAgent) {
          anyAgent.twilioAccountId = Number(twilioAccountId ?? 0);
        }
        this.modalService.openError({
          title: 'Error',
          message: 'No se pudo actualizar la cuenta de Twilio del agente.',
        });
      },
    });
  }

  saveTwilioModal(): void {
    if (this.twilioModalMode === 'existing') {
      this.assignTwilioAccountToAgent(this.selectedTwilioAccountId);
      return;
    }

    const sid = this.twilioSid.trim();
    const token = this.twilioToken.trim();

    if (!sid || !token) {
      this.modalService.openError({
        title: 'Error',
        message: 'Completa el SID y el Token de Twilio.',
      });
      return;
    }

    this.isSavingTwilioConfig = true;
    this.twilioService
      .setConfig({ twilioSid: sid, twilioToken: token })
      .subscribe({
        next: () => {
          this.loadTwilioInfo();
          this.twilioService
            .getInfo()
            .pipe(
              takeUntil(this.destroy$),
              catchError(() => of(null as TwilioConfig | null)),
            )
            .subscribe((config) => {
              const accounts = config?.accounts || [];
              const match = accounts.find((a) => a.twilioSid === sid) || null;
              this.selectedTwilioAccountId = match?.twilioAccountId ?? null;
              this.assignTwilioAccountToAgent(this.selectedTwilioAccountId);
            });
        },
        error: (error) => {
          console.error('❌ Error al guardar configuración Twilio:', error);
          this.isSavingTwilioConfig = false;
          this.modalService.openError({
            title: 'Error',
            message: 'No se pudo guardar la configuración de Twilio.',
          });
        },
      });
  }

  private loadTwilioInfo(): void {
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
      });
  }

  ngOnDestroy(): void {
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
        this.selectedShopifyDomain = (agent as any)?.shopifyDomain || '';
        this.populateForm();

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

        // Almacenar las fuentes de conocimiento
        this.agentKnowledgeSources = knowledgeSources;

        console.log('📚 Fuentes de conocimiento del agente:', {
          agentId: this.agentId,
          totalSources: knowledgeSources.length,
          sourceIds: sourceIds,
          sources: knowledgeSources,
        });
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

  private populateForm(): void {
    if (!this.agent) return;

    this.editForm.patchValue(
      {
        name: this.agent.name || '',
        type: this.agent.type || 'inbound',
        voiceId: this.agent.voiceId || '',
        firstInteraction: this.agent.firstInteraction || '',
        agentInstruction: this.agent.agentInstruction || '',
        countryCode: this.agent.phoneNumbers?.countryCode || '+34',
        phoneNumber: this.agent.phoneNumbers?.number || '',
        label: this.agent.label || '',
        state: this.agent.state || 'Activo',
        stability: this.agent.parameters?.stability ?? 0.5,
        similarity: this.agent.parameters?.similarity ?? 0.75,
        style: this.agent.parameters?.style ?? 0.0,
        boost: this.agent.parameters?.boost ?? false,
        speed: this.agent.parameters?.speed ?? 1.0,
      },
      { emitEvent: false },
    ); // No emitir eventos al poblar el formulario para evitar validaciones innecesarias
    // Precargar el audio después de poblar el formulario
    setTimeout(() => this.preloadAudio(), 200);
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

    if (!dropdown && !menu && !menuItem && !languageDropdown) {
      this.showCountryMenu = false;
      this.showLanguageMenu = false;
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
      this.modalService.openError({
        title: 'Error',
        message: 'Por favor, selecciona una voz primero.',
      });
      return;
    }

    if (!language) {
      this.modalService.openError({
        title: 'Error',
        message: 'Por favor, selecciona un idioma primero.',
      });
      return;
    }

    // Buscar la voz por voiceId para obtener su nombre
    const selectedVoice = this.voices.find((v) => v.voiceId === voiceId);
    if (!selectedVoice) {
      this.modalService.openError({
        title: 'Error',
        message: 'No se encontró la voz seleccionada.',
      });
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
      // Pulso sinusoidal suave
      this.audioLevel = Math.sin(Date.now() / 1000) * 0.2 + 0.1;
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

    return (
      !originalCountryCode ||
      !originalNumberDigits ||
      originalCountryCode !== newCountryCode ||
      originalNumberDigits !== newNumberDigits
    );
  }

  onSubmit(): void {
    if (this.editForm.valid && this.agentId) {
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

      const phoneChanged =
        !originalCountryCode ||
        !originalNumberDigits ||
        originalCountryCode !== newCountryCode ||
        originalNumberDigits !== newNumberDigits;

      // Si el teléfono cambió, debe estar validado y ser válido
      if (phoneChanged) {
        // Si aún se está validando, no permitir guardar
        if (this.isValidatingPhone) {
          this.modalService.openError({
            title: 'Validando teléfono',
            message:
              'Por favor, espera a que termine la validación del número de teléfono.',
          });
          return;
        }

        // Si no es válido, no permitir guardar
        if (this.phoneIsValid === false) {
          this.modalService.openError({
            title: 'Error de validación',
            message:
              this.phoneValidationMessage ||
              'El número de teléfono no es válido. Por favor, verifica el número.',
          });
          return;
        }

        // Si no se ha validado aún (es null), forzar validación antes de guardar
        if (this.phoneIsValid === null) {
          this.validatePhoneNumber();
          this.modalService.openError({
            title: 'Validación requerida',
            message:
              'Por favor, espera a que se valide el número de teléfono antes de guardar.',
          });
          return;
        }

        // Solo permitir guardar si es válido
        if (this.phoneIsValid !== true) {
          this.modalService.openError({
            title: 'Error de validación',
            message: 'El número de teléfono debe ser válido antes de guardar.',
          });
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
        firstInteraction: formValue.firstInteraction.trim(),
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
          this.modalService.openSuccess({
            title: 'Agente actualizado',
            message:
              response.message ||
              'El agente ha sido actualizado correctamente.',
          });
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
      this.modalService.openError({
        title: 'No se puede guardar',
        message: 'Revisa los campos del agente antes de guardar la tienda.',
      });
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
      firstInteraction: String(formValue.firstInteraction || '').trim(),
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
        this.modalService.openSuccess({
          title: 'Shopify actualizado',
          message:
            'La tienda de Shopify del agente se actualizó correctamente.',
        });
      },
      error: (error) => {
        console.error('❌ Error al actualizar Shopify del agente:', error);
        this.isSavingShopifyDomain = false;
        this.modalService.openError({
          title: 'Error',
          message: 'No se pudo actualizar la tienda de Shopify del agente.',
        });
      },
    });
  }

  goToShopifyOnboarding(): void {
    this.router.navigate(['/shopify-onboarding']);
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
      return 'Este campo es obligatorio';
    }
    if (field?.hasError('min')) {
      return `El valor mínimo es ${field.errors?.['min'].min}`;
    }
    if (field?.hasError('max')) {
      return `El valor máximo es ${field.errors?.['max'].max}`;
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
          return this.twilioService.validatePhone(countryCode, number).pipe(
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

  // Métodos para el modal de generar prompt
  openGeneratePromptModal() {
    this.showGeneratePromptModal = true;
    this.promptDescription = '';
    this.isGeneratingPrompt = false;
    this.generatePromptError = '';
  }

  closeGeneratePromptModal() {
    if (this.isGeneratingPrompt) return;
    this.showGeneratePromptModal = false;
    this.promptDescription = '';
    this.isGeneratingPrompt = false;
    this.generatePromptError = '';
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
    const enterpriseName =
      (this.userStore.user()?.enterprise?.name || '').trim() || 'Mi Empresa';

    const payload: GenerateAgentInstructionsRequest = {
      enterpriseName,
      agentName: agentName.trim() || 'Agente',
      callType: callType || 'inbound',
      language: this.normalizeLanguageCode(language),
      voiceId: voiceId || 'default', // Proporcionar un valor por defecto si no hay voz seleccionada
      voiceParameters,
      userDescription: userDescription,
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
        this.knowledgeSourceError = 'El PDF no puede exceder los 10MB';
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
                  'Error: No se recibió información del archivo subido';
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
                  'El archivo es demasiado grande (máximo 10MB)';
              } else {
                this.knowledgeSourceError = `Error al subir el archivo ${file.name}`;
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
      title: 'Añadir fuente web',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.url) {
        this.createWebSource(result.url, result.name || result.url);
      }
    });
  }

  openTextModal(): void {
    const dialogRef = this.modalService.openText({
      title: 'Añadir texto manual',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.content) {
        this.createTextSource(result.content, result.name || 'Texto manual');
      }
    });
  }

  createWebSource(url: string, name: string): void {
    if (url.length > 2048) {
      this.knowledgeSourceError = 'La URL no puede exceder los 2048 caracteres';
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
            this.knowledgeSourceError = 'Error en la respuesta del servidor';
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
              'La URL es demasiado larga (máximo 2048 caracteres)';
          } else if (err.status === 400) {
            this.knowledgeSourceError = 'URL inválida o no accesible';
          } else {
            this.knowledgeSourceError = 'Error al crear la fuente web';
          }
          this.isLoadingKnowledgeSources = false;
          this.cdr.detectChanges();
        },
      });
  }

  createTextSource(content: string, name: string): void {
    if (content.length > 50000) {
      this.knowledgeSourceError =
        'El texto no puede exceder los 50,000 caracteres (~20 páginas)';
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
          this.knowledgeSourceError = 'Error en la respuesta del servidor';
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
            'El texto es demasiado largo (máximo 50,000 caracteres)';
        } else {
          this.knowledgeSourceError = 'Error al crear la fuente de texto';
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
            'Error al vincular la fuente de conocimiento al agente';
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
            response?.message || 'Fuente desvinculada exitosamente';
          console.log('Fuente desvinculada:', message);

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
              'La fuente de conocimiento no estaba vinculada a este agente';
          } else if (err.status === 400) {
            this.knowledgeSourceError =
              'Error al desvincular la fuente de conocimiento del agente';
          } else {
            this.knowledgeSourceError =
              'Error de conexión al desvincular la fuente de conocimiento';
          }
        },
      });
  }

  clearKnowledgeSourceError(): void {
    this.knowledgeSourceError = null;
  }
}
