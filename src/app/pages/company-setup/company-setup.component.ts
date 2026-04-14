import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { UserStorage } from '../../storages/user/user-storage';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../../core/services/notification.service';
import {
  AgentsService,
  GenerateAgentInstructionsRequest,
} from '../../core/services/agents.service';
import { KnowledgeBaseService } from '../../core/services/knowledge-base.service';
import { TwilioService } from '../../core/services/twilio.service';
import { Voice } from '../../shared/models/voice.model';
import {
  SetAgentConfigDto,
  VoiceParameters,
} from '../../shared/models/agent.model';
import { ModalService } from '../../shared/modals/modal.service';
import { I18nService } from '../../core/services/i18n.service';
import { AuthSessionService } from '../../core/services/auth-session.service';
import { openPlanLimitDialog } from '../../shared/utils/plan-limit-dialog.util';
import { canAddAnotherAgent } from '../../shared/utils/plan-usage.util';
import lottie from 'lottie-web';

// Step components
import { AgentNameStepComponent } from '../new-create-agents/steps/agent-name-step/agent-name-step.component';
import { CallTypeStepComponent } from '../new-create-agents/steps/call-type-step/call-type-step.component';
import { VoicesStepComponent } from '../new-create-agents/steps/voices-step/voices-step.component';
import { ConnectBusinessStepComponent } from '../new-create-agents/steps/connect-business-step/connect-business-step.component';
import { InstructionsStepComponent } from '../new-create-agents/steps/instructions-step/instructions-step.component';
import { KnowledgeBaseStepComponent } from '../new-create-agents/steps/knowledge-base-step/knowledge-base-step.component';
import { TestAgentStepComponent } from '../new-create-agents/steps/test-agent-step/test-agent-step.component';
import { ConnectPhoneStepComponent } from '../new-create-agents/steps/connect-phone-step/connect-phone-step.component';

interface CompanyType {
  id: string;
  name: string;
}

interface EmployeeRange {
  id: string;
  range: string;
}

@Component({
  selector: 'app-company-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    AgentNameStepComponent,
    CallTypeStepComponent,
    VoicesStepComponent,
    ConnectBusinessStepComponent,
    InstructionsStepComponent,
    KnowledgeBaseStepComponent,
    TestAgentStepComponent,
    ConnectPhoneStepComponent,
  ],
  templateUrl: './company-setup.component.html',
  styleUrl: './company-setup.component.scss',
})
export class CompanySetupComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  // Servicios inyectados
  private userService = inject(UserService);
  private userStore = inject(UserStorage);
  private notificationService = inject(NotificationService);
  private agentsService = inject(AgentsService);
  private knowledgeBaseService = inject(KnowledgeBaseService);
  private twilioService = inject(TwilioService);
  private modalService = inject(ModalService);
  private route = inject(ActivatedRoute, { optional: true });
  private i18nService = inject(I18nService);
  private authSession = inject(AuthSessionService);

  get t() {
    return this.i18nService.getTranslations();
  }

  @ViewChild('lottieContainer', { static: false })
  lottieContainer!: ElementRef<HTMLDivElement>;

  private isBrowser: boolean = false;
  private lottieInstance: any = null;
  private lottieInitialized = false;

  // Datos del formulario
  businessName: string = 'LLAMALO S.L';
  selectedCompanyType: string = '';
  selectedEmployeeRange: string = '';

  // Opciones para los dropdowns
  companyTypes: CompanyType[] = [
    { id: 'startup', name: 'Startup' },
    { id: 'small-business', name: 'Pequeña empresa' },
    { id: 'medium-business', name: 'Mediana empresa' },
    { id: 'large-corporation', name: 'Gran corporación' },
    { id: 'freelancer', name: 'Freelancer/Autónomo' },
    { id: 'non-profit', name: 'Organización sin ánimo de lucro' },
    { id: 'other', name: 'Otro' },
  ];

  employeeRanges: EmployeeRange[] = [
    { id: '1', range: '1 empleado' },
    { id: '2-5', range: '2-5 empleados' },
    { id: '6-10', range: '6-10 empleados' },
    { id: '11-50', range: '11-50 empleados' },
    { id: '51-200', range: '51-200 empleados' },
    { id: '201-500', range: '201-500 empleados' },
    { id: '500+', range: 'Más de 500 empleados' },
  ];

  // Opciones de uso principal
  mainUsageOptions = [
    {
      id: 'customer-service',
      name: 'Atención al cliente',
    },
    {
      id: 'appointments',
      name: 'Agendar citas',
    },
    {
      id: 'cart-recovery',
      name: 'Recuperación de carritos',
    },
    {
      id: 'phone-sales',
      name: 'Ventas telefónicas',
    },
  ];

  // Opciones seleccionadas (se pueden elegir varias)
  // Al entrar en el onboarding no debe haber ninguna tarjeta preseleccionada
  selectedMainUsages: string[] = [];

  // Animaciones zona 1 (onboarding - usos principales)
  // Solo se animan las tarjetas; el fondo blanco permanece siempre fijo
  isMainUsageAnimating = false;
  mainUsageSelectedForTransition: string | null = null;
  selectedCardFadingOut = false;

  // Animación de entrada suave para la zona 2
  step2ContentVisible = true;

  // Sonido de click para botones del onboarding
  // En SSR (Node) no existe `Audio`, así que lo inicializamos solo en navegador
  private clickAudio: HTMLAudioElement | null = null;

  // Intro de vídeo antes de la zona 1
  // Intro de bienvenida animada
  showWelcomeSequence = true;
  isWelcomeFading = false;
  welcomeExitTriggered = false;

  // Animación "Vamos a crear tu primer agente" (tras Cómo nos conociste)
  showAgentIntroAnimation = false;
  agentIntroExitTriggered = false;

  // Paso 2: opciones de cómo nos conociste
  discoveryOptions = [
    {
      id: 'social',
      label: 'Redes sociales (Instagram / TikTok / Twitter / LinkedIn)',
    },
    { id: 'youtube', label: 'YouTube' },
    { id: 'google', label: 'Google / Buscando alternativas' },
    {
      id: 'communities',
      label: 'Comunidades / Grupos (Slack, Discord, Telegram)',
    },
    { id: 'events', label: 'Evento o webinar' },
    { id: 'friend', label: 'Recomendación de un amigo o colega' },
    { id: 'other-source', label: 'Otro' },
  ];

  selectedDiscoveryChannels: string[] = [];

  // Estado para el logo
  selectedLogo: File | null = null;
  logoPreview: string | null = null;

  // Estado para controlar si el setup está activo
  isSetupActive: boolean = false;

  // Estado para controlar el paso actual
  currentStep: number = 1;
  maxStep: number = 11;
  /** Paso visible (fade); `currentStep` es el lógico inmediato (como en new-create-agents) */
  displayedStep: number = 1;
  isStepFadingOut = false;
  private stepFadeTimeout: ReturnType<typeof setTimeout> | null = null;

  // ===== Propiedades para pasos de creación de agente (3-10) =====

  // Paso 3: Nombre del agente
  agentName = '';

  // Paso 4: Tipo de llamada
  selectedCallType: 'inbound' | 'outbound' | null = null;

  // Paso 5: País y voz
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
  selectedCountry = 'es';
  selectedCountryCode = '+34';
  voices: any[] = [];
  selectedVoiceId = '';
  currentPlayingVoice: string | null = null;
  private audioActual: HTMLAudioElement | null = null;
  private isPlaying = false;
  private voicesLoaded = false;
  voiceParameters: VoiceParameters = {
    stability: 0.72,
    similarity: 0.8,
    style: 0.5,
    boost: true,
    speed: 0.98,
  };
  private readonly defaultVoicesData = [
    {
      name: 'Carla',
      image: 'assets/carla_prueba1.png',
      description:
        'Diseñadora de Producto enfocada en simplicidad y usabilidad.',
      badgeText: 'Top 1% Voz',
    },
    {
      name: 'Carlos',
      image: 'assets/carlos_prueba1.png',
      description:
        'Especialista en Soporte Técnico con tono calmado y resolutivo.',
      badgeText: 'Top 5% Voz',
    },
    {
      name: 'David',
      image: 'assets/david_prueba1.png',
      description: 'Ejecutivo de Ventas con energía y capacidad de persuasión.',
      badgeText: 'Top Ventas',
    },
    {
      name: 'Jesús',
      image: 'assets/jesus_prueba1.png',
      description:
        'Asistente Virtual amigable ideal para recepción de llamadas.',
      badgeText: 'Popular',
    },
    {
      name: 'Claudia',
      image: 'assets/claudia_prueba1.png',
      description: 'Narradora profesional perfecta para contenido educativo.',
      badgeText: 'Nueva',
    },
    {
      name: 'María',
      image: 'assets/maria_prueba1.png',
      description:
        'Agente de atención al cliente con gran empatía y paciencia.',
      badgeText: 'Destacada',
    },
  ];
  private readonly VOCES_LANG_CODES: readonly string[] = [
    'es',
    'en',
    'it',
    'de',
    'fr',
  ];

  // Paso 6: Conecta tu negocio (Shopify)
  shopifyConnectedDomain: string | null = null;

  // Paso 7: Instrucciones
  greeting = '';
  instructions = '';
  showMakeConfig = false;
  isMakeConfigClosing = false;
  makeActionData = { name: '', description: '', serverUrl: '' };
  makeActionActive = false;
  makeGeneratedWebhook = '';
  showGeneratePromptModal = false;
  isGeneratePromptDropdownClosing = false;
  promptDescription = '';
  promptEnterpriseName = '';
  isGeneratingPrompt = false;
  generatePromptError = '';
  showExpandInstructionsModal = false;
  isInstructionsModalClosing = false;

  // Paso 8: Base de conocimientos
  selectedKnowledgeSourceIds: string[] = [];

  // Paso 9: Prueba de agente
  isMicrophoneActive = false;
  audioLevel = 0;
  audioContext: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  microphone: MediaStreamAudioSourceNode | null = null;
  animationFrame: number | null = null;

  // Paso 10: Conecta tu número de teléfono (Twilio)
  phoneNumber = '';
  showTwilioConfig = false;
  twilioSid = '';
  twilioToken = '';
  isValidatingTwilio = false;
  twilioValidationStatus: 'success' | 'error' | null = null;
  twilioErrorMessage = '';
  isTwilioValidated = false;
  twilioSidValidationStatus: 'success' | 'error' | null = null;
  twilioTokenValidationStatus: 'success' | 'error' | null = null;
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
  availablePhoneNumbers: Array<{
    phoneId: number;
    countryCode: string;
    number: string;
    state?: 'Activo' | 'Inactivo';
    importedBy?: string;
    twilioAccountId?: number;
  }> = [];
  loadingPhoneNumbers = false;
  isValidatingPhone = false;
  phoneValidationStatus: 'success' | 'error' | null = null;
  phoneErrorMessage = '';
  private phoneValidationTimeout: any = null;

  // Estado de paso "final" (creando agente)
  isCreatingAgent = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Aquí podrías verificar si el usuario ya completó el setup
    // Por defecto está desactivado, se activa con el botón
    this.isSetupActive = false;
    this.showWelcomeSequence = true;

    // Inicializar audio solo en entorno navegador para evitar errores en SSR
    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      this.clickAudio = new Audio('assets/click.mp3');
    }
    // Cargar la imagen de perfil existente del usuario
    const currentUser = this.userStore.user();
    if (currentUser?.profileImage) {
      this.logoPreview = currentUser.profileImage;
    }

    // Inicializar greeting con nombre de empresa
    this.greeting = this.getGreetingWithCompanyName();

    // Manejar retorno de Shopify si aplica
    if (this.isBrowser) {
      this.handleShopifyReturnParams();
      document.body.classList.add('creating-agent');
    }
    
    // Si no estamos saltando a un paso específico debido a Shopify, iniciar secuencia normal
    if (this.showWelcomeSequence) {
      this.startWelcomeSequence();
    }
  }

  ngAfterViewChecked() {
    if (
      this.isCreatingAgent &&
      this.lottieContainer &&
      !this.lottieInitialized
    ) {
      this.initLottie();
    } else if (!this.isCreatingAgent && this.lottieInitialized) {
      this.destroyLottie();
    }
  }

  private initLottie() {
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

  private destroyLottie() {
    if (this.lottieInstance) {
      this.lottieInstance.destroy();
      this.lottieInstance = null;
      this.lottieInitialized = false;
    }
  }

  ngOnDestroy() {
    this.stopMicrophone();
    this.pauseVoice();
    this.destroyLottie();
    if (this.stepFadeTimeout) {
      clearTimeout(this.stepFadeTimeout);
      this.stepFadeTimeout = null;
    }
    if (this.phoneValidationTimeout) {
      clearTimeout(this.phoneValidationTimeout);
    }
    // Quitar clase del body para el widget de soporte
    if (this.isBrowser) {
      document.body.classList.remove('creating-agent');
    }
  }

  // Método para activar/desactivar el setup (para testing)
  toggleSetup() {
    this.isSetupActive = !this.isSetupActive;
    if (this.isSetupActive) {
      this.currentStep = 1;
      this.displayedStep = 1;
      this.isStepFadingOut = false;
      if (this.stepFadeTimeout) {
        clearTimeout(this.stepFadeTimeout);
        this.stepFadeTimeout = null;
      }
      this.step2ContentVisible = true;
      this.showWelcomeSequence = true;
      this.welcomeExitTriggered = false;
      this.isWelcomeFading = false;
      this.startWelcomeSequence();
    }
  }

  // Reproducir sonido de click (con manejo básico de errores)
  playClick() {
    if (!this.clickAudio) {
      return;
    }
    try {
      this.clickAudio.currentTime = 0;
      this.clickAudio.play();
    } catch (e) {
      console.error('No se pudo reproducir el sonido de click', e);
    }
  }

  // Control de la intro de vídeo
  startWelcomeSequence() {
    setTimeout(() => {
      this.welcomeExitTriggered = true;
      setTimeout(() => {
        this.showWelcomeSequence = false;
      }, 1000); // Duración de la animación de salida (cortina)
    }, 3000); // 3 segundos de espera (reducido de 5s)
  }

  skipWelcome() {
    this.welcomeExitTriggered = true;
    setTimeout(() => {
      this.showWelcomeSequence = false;
    }, 200);
  }

  // Animación tras "Cómo nos conociste" -> paso 3 (nombre agente) ya preparado mientras se anima
  startAgentIntroAnimation() {
    // Sin fade: el overlay cubre la vista; el paso 3 debe estar ya montado detrás
    this.goToStep(3, { instant: true });
    this.showAgentIntroAnimation = true;
    this.agentIntroExitTriggered = false;
    setTimeout(() => {
      this.agentIntroExitTriggered = true;
      setTimeout(() => {
        this.showAgentIntroAnimation = false; // Overlay se quita -> paso 3 visible al instante
      }, 1000);
    }, 3000);
  }

  // Método para continuar con la configuración
  continueSetup() {
    this.goToStep(this.currentStep + 1);
  }

  // Método para seleccionar una opción de uso principal
  selectMainUsage(usageId: string) {
    const index = this.selectedMainUsages.indexOf(usageId);
    if (index > -1) {
      // Si ya está seleccionada, la deselecciona
      this.selectedMainUsages.splice(index, 1);
    } else {
      // Si no está seleccionada, la añade a la lista
      this.selectedMainUsages.push(usageId);
    }
  }

  // Maneja el click en una tarjeta de la zona 1 con animación y cambio suave a la zona 2
  handleMainUsageClick(usageId: string) {
    // Evitar dobles clics mientras la animación está en curso
    if (this.isMainUsageAnimating) {
      return;
    }

    // Dejamos únicamente la opción pulsada como seleccionada
    this.selectedMainUsages = [usageId];
    this.mainUsageSelectedForTransition = usageId;
    this.isMainUsageAnimating = true;
    this.selectedCardFadingOut = false;
    this.step2ContentVisible = false;

    // 1) Animar: las demás tarjetas se desvanecen (controlado por *ngClass)
    // 2) Mantener un tiempo la tarjeta seleccionada visible
    const selectedVisibleDelay = 550; // ms con la tarjeta seleccionada visible sola
    const selectedFadeOutDuration = 250; // ms de fade-out del recuadro seleccionado
    const step2DelayAfterFade = 200; // ms extra antes de mostrar contenido de zona 2

    // Fase 1: mantener seleccionada
    setTimeout(() => {
      // Fase 2: iniciar fade-out suave del recuadro seleccionado
      this.selectedCardFadingOut = true;

      setTimeout(() => {
        // Fase 3: cambiar al paso 2 (ya sin ver el recuadro seleccionado)
        this.goToStep(2);

        // Fase 4: mostrar suavemente el contenido de la zona 2
        setTimeout(() => {
          this.step2ContentVisible = true;
          this.isMainUsageAnimating = false;
          this.mainUsageSelectedForTransition = null;
          this.selectedCardFadingOut = false;
        }, step2DelayAfterFade);
      }, selectedFadeOutDuration);
    }, selectedVisibleDelay);
  }

  // Paso 2: seleccionar cómo nos conociste (multi-selección sencilla)
  toggleDiscoveryChannel(channelId: string) {
    const index = this.selectedDiscoveryChannels.indexOf(channelId);
    if (index > -1) {
      this.selectedDiscoveryChannels.splice(index, 1);
    } else {
      this.selectedDiscoveryChannels.push(channelId);
    }
  }

  // Método para saltar la configuración
  skipSetup() {
    if (this.currentStep === 1) {
      this.goToStep(2);
    } else if (this.currentStep === 2) {
      this.startAgentIntroAnimation();
    } else if (this.currentStep >= 3 && this.currentStep <= 10) {
      // Avanzar al siguiente paso de creación de agente
      this.goToStep(this.currentStep + 1);
    } else if (this.currentStep === 11) {
      this.completeSetup();
    }
  }

  // Método para ir hacia atrás
  goBack() {
    if (this.currentStep === 1) {
      // GuestGuard devuelve al dashboard si sigue habiendo token; hay que cerrar sesión primero.
      void this.authSession.clearSession().then(() => {
        void this.router.navigate(['/login'], { replaceUrl: true });
      });
      return;
    }

    // Animación especial al volver del paso 2 al paso 1
    if (this.currentStep === 2) {
      const backFadeDuration = 200;
      this.step2ContentVisible = false;
      setTimeout(() => {
        this.goToStep(1);
      }, backFadeDuration);
      return;
    }

    // Volver del paso 3 al paso 2
    if (this.currentStep === 3) {
      this.goToStep(2);
      return;
    }

    // Pasos de creación de agente: retroceder con lógica especial
    if (this.currentStep === 5) {
      this.pauseVoice();
      this.goToStep(4);
      return;
    }
    if (this.currentStep === 9) {
      this.stopMicrophone();
      this.goToStep(8);
      return;
    }
    if (this.currentStep === 11) {
      this.goToStep(10);
      return;
    }

    this.goToStep(this.currentStep - 1);
  }

  // Método genérico para ir a un paso concreto (fade entre pasos como new-create-agents)
  goToStep(step: number, options?: { instant?: boolean }) {
    if (step < 1) {
      step = 1;
    }
    if (step > this.maxStep) {
      step = this.maxStep;
    }

    const previousStep = this.currentStep;

    // Detener micrófono si salimos del paso 9
    if (previousStep === 9 && step !== 9) {
      this.stopMicrophone();
    }

    this.currentStep = step;

    // Paso 2: contenido visible al instante (sin animación)
    if (step === 2) {
      this.step2ContentVisible = true;
    }

    // Cargar voces al entrar al paso 5
    if (step === 5) {
      this.loadVoices();
    }

    // Animar idle al entrar al paso 9 (prueba de agente)
    if (step === 9 && this.isBrowser) {
      this.animateIdle();
    }

    // Cargar cuentas Twilio al entrar al paso 10
    if (step === 10) {
      this.loadTwilioAccounts();
    }

    // Transición visual (misma cadencia que creación de agentes)
    if (options?.instant) {
      this.displayedStep = step;
      this.isStepFadingOut = false;
      if (this.stepFadeTimeout) {
        clearTimeout(this.stepFadeTimeout);
        this.stepFadeTimeout = null;
      }
      return;
    }

    if (this.displayedStep === step) {
      this.isStepFadingOut = false;
      if (this.stepFadeTimeout) {
        clearTimeout(this.stepFadeTimeout);
        this.stepFadeTimeout = null;
      }
      return;
    }

    this.isStepFadingOut = true;
    if (this.stepFadeTimeout) {
      clearTimeout(this.stepFadeTimeout);
    }
    this.stepFadeTimeout = setTimeout(() => {
      this.displayedStep = step;
      this.isStepFadingOut = false;
      this.stepFadeTimeout = null;
    }, 250);
  }

  // Método para manejar la subida del logo
  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.notificationService.error(
          'Por favor, selecciona un archivo de imagen válido',
        );
        return;
      }

      // Validar tamaño (máximo 10MB - más permisivo)
      if (file.size > 10 * 1024 * 1024) {
        this.notificationService.error('La imagen debe ser menor a 10MB');
        return;
      }

      // Mostrar preview inmediatamente
      this.selectedLogo = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);

      // Mostrar notificación de carga
      this.notificationService.success('Subiendo imagen...');

      // TEMPORAL: Mantener la imagen local sin subir al backend por ahora
      setTimeout(() => {
        this.notificationService.success(
          'Imagen cargada correctamente (modo local)',
        );
      }, 1000);

      return; // Salir aquí temporalmente para evitar la subida al backend

      // Subir al backend
      this.userService.uploadProfileImage(file).subscribe({
        next: (response: any) => {
          // Verificar que la respuesta tenga la URL de la imagen
          if (response && response.imageUrl) {
            // Actualizar el usuario en el storage con la nueva imagen
            const currentUser = this.userStore.user();
            if (currentUser) {
              const updatedUser = {
                ...currentUser,
                profileImage: response.imageUrl,
              };
              this.userStore.setUser(updatedUser);
            }

            // Actualizar el preview con la URL del backend
            this.logoPreview = response.imageUrl;
            this.notificationService.success('Logo subido correctamente');
          } else {
            console.error('Respuesta del backend sin imageUrl:', response);
            this.notificationService.error(
              'Error: No se recibió la URL de la imagen del servidor',
            );
          }
        },
        error: (error: any) => {
          console.error('Error completo al subir imagen:', error);
          this.notificationService.error(
            `Error al subir la imagen: ${error.message || 'Error desconocido'}`,
          );
          // NO limpiar el preview en caso de error - mantener la imagen local
          // this.logoPreview = null;
          // this.selectedLogo = null;
        },
      });
    }
  }

  // Método para activar el input de archivo
  triggerFileUpload() {
    const fileInput = document.getElementById('logoUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Método para completar el setup
  completeSetup() {
    this.isSetupActive = false;

    // Actualizamos el usuario en el backend
    this.userService.updateUserProfile({ hasCompletedSetup: true }).subscribe({
      next: (response) => {
        // Actualizamos el storage local
        const currentUser = this.userStore.user();
        if (currentUser) {
          this.userStore.setUser({
            ...currentUser,
            hasCompletedSetup: true,
          });
        }
        this.router.navigate(['/dashboard/home']);
      },
      error: (error) => {
        console.error('Error actualizando perfil:', error);
        // Aun así lo dejamos pasar para no bloquear al usuario
        const currentUser = this.userStore.user();
        if (currentUser) {
          this.userStore.setUser({
            ...currentUser,
            hasCompletedSetup: true,
          });
        }
        this.router.navigate(['/dashboard/home']);
      },
    });
  }

  // ===== Métodos de pasos de creación de agente =====

  // Helpers para step number del flujo de agente (pasos 3-10 → step 1-8)
  getAgentStepNumber(): number {
    return this.currentStep - 2; // Step 3 → 1, Step 4 → 2, etc.
  }

  getAgentTotalSteps(): number {
    return 8;
  }

  getGreetingWithCompanyName(): string {
    const companyName = this.userStore.user()?.enterprise?.name;
    if (companyName && companyName.trim() !== '') {
      return `Hola, gracias por llamar a ${companyName.trim()}. ¿En qué puedo ayudarte?`;
    } else {
      return 'Hola, gracias por llamar. ¿En qué puedo ayudarte?';
    }
  }

  // Paso 3: Nombre del agente
  onSubmitAgentName() {
    const name = this.agentName?.trim();
    if (!name) {
      this.modalService.openError({
        title: 'Nombre requerido',
        message: 'Por favor, ingresa un nombre para el agente.',
      });
      return;
    }
    this.goToStep(4);
  }

  // Paso 4: Tipo de llamada
  onContinueFromCallType() {
    this.goToStep(5);
  }

  // Paso 5: Voces
  private loadVoices() {
    if (this.voicesLoaded) return;
    this.agentsService.getVoices().subscribe({
      next: (backendVoices: Voice[]) => {
        this.voices = backendVoices.map((voice: Voice) => {
          const defaultVoice = this.defaultVoicesData.find(
            (v) => v.name.toLowerCase() === voice.name.toLowerCase(),
          );
          return {
            id: voice.voiceId,
            voiceId: voice.voiceId,
            name: voice.name,
            image: defaultVoice?.image || '',
            isCustom: false,
            description: defaultVoice?.description || `Voz ${voice.name}`,
            badgeText: defaultVoice?.badgeText || '',
          };
        });
        this.voicesLoaded = true;
      },
      error: (error) => {
        console.error('Error al cargar las voces:', error);
        this.voices = [];
      },
    });
  }

  selectCountry(countryCode: string) {
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
    this.pauseVoice();
    this.selectedCountryCode = countryCodeMap[countryCode] || '+34';
    this.selectedCountry = countryCode;
    this.loadVoices();
  }

  selectVoice(voiceId: string) {
    this.pauseVoice();
    this.selectedVoiceId = voiceId;
  }

  playVoice(voice: { id?: string; name?: string; voiceId?: string }) {
    const voiceName = voice?.name?.toLowerCase() || '';
    if (!voiceName) return;
    const voiceIdentifier = voice?.id || voice?.voiceId || '';
    if (!voiceIdentifier) return;

    if (this.isPlaying && this.currentPlayingVoice === voiceIdentifier) {
      this.pauseVoice();
      return;
    }

    let lang = this.selectedCountry;
    if (lang === 'us') lang = 'en';
    else if (!this.VOCES_LANG_CODES.includes(lang)) lang = 'es';

    const normalizedVoiceName = voiceName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
    const path = `assets/voces/${normalizedVoiceName}_${lang}.mp3`;

    if (this.audioActual) {
      this.audioActual.pause();
      this.audioActual.currentTime = 0;
    }

    const audio = new Audio(path);
    this.audioActual = audio;
    this.isPlaying = true;
    this.currentPlayingVoice = voiceIdentifier;

    audio.onerror = () => {
      this.isPlaying = false;
      this.currentPlayingVoice = null;
      if (this.audioActual === audio) this.audioActual = null;
    };
    audio.onended = () => {
      this.isPlaying = false;
      this.currentPlayingVoice = null;
      if (this.audioActual === audio) this.audioActual = null;
    };
    audio.play().catch(() => {
      this.isPlaying = false;
      this.currentPlayingVoice = null;
    });
  }

  playVoicePreview(voice: any, event: Event) {
    event.stopPropagation();
    if (this.currentPlayingVoice === voice.voiceId) {
      this.pauseVoice();
    } else {
      this.playVoice(voice);
    }
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

  onContinueFromVoices() {
    this.pauseVoice();
    this.goToStep(6);
  }

  // Paso 6: Conecta tu negocio
  goToShopifyOnboarding(): void {
    this.router.navigate(['/shopify-onboarding'], { queryParams: { source: 'onboarding' } });
  }

  onContinueFromConnectBusiness() {
    this.goToStep(7);
  }

  private handleShopifyReturnParams(): void {
    const params = this.route?.snapshot?.queryParams;
    if (!params) return;

    // Solo reaccionar si estamos explícitamente en la ruta /company-setup (o si se agregó un flag interno)
    // Esto evita que si el componente está montado oculto dentro de /dashboard, secuestre la pantalla
    // cuando el creador de agentes de la web use el parámetro step=connectBusiness.
    if (!this.router.url.includes('/company-setup')) {
      return;
    }

    // Si viene con el step de Shopify, saltar directamente a ese paso
    if (params['step'] === 'connectBusiness') {
      this.isSetupActive = true;
      this.showWelcomeSequence = false;
      this.welcomeExitTriggered = true;
      this.goToStep(6, { instant: true });
    }

    if (params['shopify'] === undefined) return;

    const shopify = params['shopify'];
    const shop = params['shop'] ?? '';

    if (shopify === 'success' && shop) {
      this.shopifyConnectedDomain = shop;
    }
  }

  // Paso 7: Instrucciones
  toggleMakeConfig() {
    if (this.showMakeConfig) {
      this.isMakeConfigClosing = true;
      setTimeout(() => {
        this.showMakeConfig = false;
        this.isMakeConfigClosing = false;
      }, 200);
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
    if (!this.makeGeneratedWebhook) {
      this.makeGeneratedWebhook = this.generateMockMakeWebhook();
    }
    this.makeActionActive = true;
    this.isMakeConfigClosing = true;
    setTimeout(() => {
      this.showMakeConfig = false;
      this.isMakeConfigClosing = false;
    }, 200);
  }

  private generateMockMakeWebhook(): string {
    const token =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID().replace(/-/g, '').slice(0, 32)
        : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    return `https://hooks.llamalo.ai/make/${token}`;
  }

  onEditMakeAction(): void {
    this.showMakeConfig = true;
    this.isMakeConfigClosing = false;
  }

  onDeleteMakeAction(): void {
    const actionLabel =
      this.makeActionData.name?.trim() || 'esta acción';
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

  toggleGeneratePromptDropdown() {
    if (this.showGeneratePromptModal) {
      this.closeGeneratePromptModal();
    } else {
      this.showGeneratePromptModal = true;
      this.promptEnterpriseName =
        (this.userStore.user()?.enterprise?.name || '').trim() || 'Mi Empresa';
      this.isGeneratePromptDropdownClosing = false;
      this.generatePromptError = '';
    }
  }

  closeGeneratePromptModal() {
    this.isGeneratePromptDropdownClosing = true;
    setTimeout(() => {
      this.showGeneratePromptModal = false;
      this.isGeneratePromptDropdownClosing = false;
    }, 150);
  }

  generatePrompt() {
    if (!this.promptDescription.trim()) {
      this.generatePromptError =
        'Por favor, describe el comportamiento del agente.';
      return;
    }
    this.isGeneratingPrompt = true;
    this.generatePromptError = '';

    const companyName = this.promptEnterpriseName.trim() || 'Mi Empresa';
    const request: GenerateAgentInstructionsRequest = {
      enterpriseName: companyName,
      agentName: this.agentName || 'Agente',
      callType: this.selectedCallType || 'inbound',
      language: this.selectedCountry || 'es',
      voiceId: this.selectedVoiceId || '',
      voiceParameters: {
        stability: this.voiceParameters.stability,
        similarity: this.voiceParameters.similarity,
        style: this.voiceParameters.style,
        boost: this.voiceParameters.boost,
        speed: this.voiceParameters.speed,
      },
      userDescription: this.promptDescription,
      ...(this.shopifyConnectedDomain && {
        shopDomain: this.shopifyConnectedDomain,
      }),
    };

    this.agentsService.generateAgentInstructions(request).subscribe({
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

  openExpandInstructionsModal() {
    this.showExpandInstructionsModal = true;
    this.isInstructionsModalClosing = false;
  }

  closeExpandInstructionsModal() {
    this.isInstructionsModalClosing = true;
    setTimeout(() => {
      this.showExpandInstructionsModal = false;
      this.isInstructionsModalClosing = false;
    }, 150);
  }

  onContinueFromInstructions() {
    this.goToStep(8);
  }

  // Paso 8: Base de conocimientos
  onSourceSelected(source: string) {
    // Delegado al componente hijo
  }

  onKnowledgeBaseContinue(selectedSourceIds: string[]) {
    this.selectedKnowledgeSourceIds = selectedSourceIds;
    this.goToStep(9);
  }

  // Paso 9: Prueba de agente
  async toggleMicrophone() {
    if (this.isMicrophoneActive) {
      this.stopMicrophone();
      this.animateIdle();
    } else {
      await this.startMicrophone();
    }
  }

  private async startMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
        },
      });
      this.audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.4;
      this.analyser.minDecibels = -60;
      this.analyser.maxDecibels = -10;
      this.microphone.connect(this.analyser);
      this.isMicrophoneActive = true;
      this.animateAudioLevel();
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      this.notificationService.error(
        'No se pudo acceder al micrófono. Por favor, verifica los permisos.',
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
      if (!this.isBrowser || this.isMicrophoneActive || this.currentStep !== 9)
        return;
      this.audioLevel = Math.sin(Date.now() / 1000) * 0.2 + 0.1;
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  private animateAudioLevel() {
    if (!this.isMicrophoneActive || !this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    const updateLevel = () => {
      this.analyser!.getByteFrequencyData(dataArray);
      let max = 0;
      for (let i = 0; i < dataArray.length; i++) {
        max = Math.max(max, dataArray[i]);
      }
      let normalizedLevel = Math.min(max / 255, 1.0);
      const targetLevel = normalizedLevel * 1.8;
      this.audioLevel = this.audioLevel * 0.75 + targetLevel * 0.25;
      this.audioLevel = Math.min(this.audioLevel, 3.5);
      if (this.isMicrophoneActive) {
        this.animationFrame = requestAnimationFrame(updateLevel);
      }
    };
    updateLevel();
  }

  onSubmitTestCall() {
    this.goToStep(10);
  }

  // Paso 10: Twilio
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
          this.showNewTwilioAccountForm = false;
        } else {
          this.twilioAccounts = [];
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

  toggleTwilioConfig() {
    this.showTwilioConfig = !this.showTwilioConfig;
  }

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

  validateTwilioConfig() {
    if (!this.twilioSid?.trim() || !this.twilioToken?.trim()) {
      this.modalService.openError({
        title: 'Campos requeridos',
        message:
          'Por favor, completa tanto el Account SID como el Auth Token antes de validar.',
      });
      return;
    }

    this.twilioValidationStatus = null;
    this.twilioErrorMessage = '';
    this.twilioSidValidationStatus = null;
    this.twilioTokenValidationStatus = null;
    this.isValidatingTwilio = true;

    const config: {
      twilioSid: string;
      twilioToken: string;
      twilioAccountId?: number;
    } = {
      twilioSid: this.twilioSid.trim(),
      twilioToken: this.twilioToken.trim(),
    };
    if (this.selectedTwilioAccount) {
      config.twilioAccountId = this.selectedTwilioAccount.twilioAccountId;
    }

    this.twilioService.setConfig(config).subscribe({
      next: () => {
        this.isValidatingTwilio = false;
        this.twilioValidationStatus = 'success';
        this.twilioSidValidationStatus = 'success';
        this.twilioTokenValidationStatus = 'success';
        this.isTwilioValidated = true;

        if (!this.selectedTwilioAccount) {
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
                  this.loadAvailablePhoneNumbers();
                }
              }
            },
            error: (error) =>
              console.error(
                'Error al obtener perfil después de validar:',
                error,
              ),
          });
        } else {
          this.loadAvailablePhoneNumbers();
        }

        if (this.phoneNumber?.trim()) {
          this.validatePhoneNumber();
        }
      },
      error: (error) => {
        this.isValidatingTwilio = false;
        this.twilioValidationStatus = 'error';
        this.twilioSidValidationStatus = 'error';
        this.twilioTokenValidationStatus = 'error';
        this.isTwilioValidated = false;
        this.twilioErrorMessage =
          error?.error?.message ||
          error?.message ||
          'Error al validar la configuración de Twilio.';
      },
    });
  }

  get isTwilioCompletelyValidated(): boolean {
    return (
      this.twilioSidValidationStatus === 'success' &&
      this.twilioTokenValidationStatus === 'success' &&
      this.phoneValidationStatus === 'success' &&
      this.isTwilioValidated
    );
  }

  get canContinueFromConnections(): boolean {
    return this.isTwilioCompletelyValidated;
  }

  useExistingTwilioAccount(account: {
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  }) {
    this.selectedTwilioAccount = account;
    this.twilioSid = account.twilioSid;
    this.twilioToken = account.twilioToken;
    this.showNewTwilioAccountForm = false;
    this.phoneValidationStatus = null;
    this.phoneErrorMessage = '';
    this.phoneNumber = '';
    this.validateTwilioConfig();
    this.loadAvailablePhoneNumbers();
  }

  showNewTwilioAccount() {
    this.selectedTwilioAccount = null;
    this.twilioSid = '';
    this.twilioToken = '';
    this.showNewTwilioAccountForm = true;
    this.showTwilioConfig = true;
    this.twilioValidationStatus = null;
    this.twilioSidValidationStatus = null;
    this.twilioTokenValidationStatus = null;
    this.isTwilioValidated = false;
    this.phoneValidationStatus = null;
    this.phoneErrorMessage = '';
    this.phoneNumber = '';
    this.availablePhoneNumbers = [];
  }

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

  loadAvailablePhoneNumbers() {
    if (!this.selectedTwilioAccount) {
      this.availablePhoneNumbers = [];
      return;
    }
    this.loadingPhoneNumbers = true;
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        this.loadingPhoneNumbers = false;
        const allPhoneNumbers = profile.phoneNumbers || [];
        const agentPhoneNumbers = new Set<string>();
        if (profile.agents && Array.isArray(profile.agents)) {
          profile.agents.forEach((agent) => {
            if (agent.phoneNumbers) {
              agentPhoneNumbers.add(
                `${agent.phoneNumbers.countryCode}${agent.phoneNumbers.number}`,
              );
            }
          });
        }
        this.availablePhoneNumbers = allPhoneNumbers.filter((phone) => {
          const belongsToAccount =
            phone.twilioAccountId ===
            this.selectedTwilioAccount!.twilioAccountId;
          const notInAgents = !agentPhoneNumbers.has(
            `${phone.countryCode}${phone.number}`,
          );
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

  onPhoneNumberSelected(event: { countryCode: string; number: string }) {
    this.phoneNumber = event.number;
    this.selectedCountryCode = event.countryCode.startsWith('+')
      ? event.countryCode
      : '+' + event.countryCode;
    this.validatePhoneNumber();
  }

  onPhoneNumberChange() {
    if (this.phoneValidationTimeout) clearTimeout(this.phoneValidationTimeout);
    if (!this.phoneNumber?.trim()) {
      this.phoneValidationStatus = null;
      this.phoneErrorMessage = '';
      this.isValidatingPhone = false;
      return;
    }
    if (!this.isTwilioValidated) {
      this.phoneValidationStatus = null;
      return;
    }
    this.phoneValidationTimeout = setTimeout(
      () => this.validatePhoneNumber(),
      500,
    );
  }

  validatePhoneNumber() {
    if (!this.phoneNumber?.trim()) return;
    const countryCode = this.selectedCountryCode || '+34';
    const number = this.phoneNumber.trim();
    this.phoneValidationStatus = null;
    this.phoneErrorMessage = '';
    this.isValidatingPhone = true;
    const twilioAccountId = this.selectedTwilioAccount?.twilioAccountId;

    this.twilioService
      .validatePhone(countryCode, number, twilioAccountId)
      .subscribe({
        next: () => {
          this.isValidatingPhone = false;
          this.phoneValidationStatus = 'success';
        },
        error: (error) => {
          this.isValidatingPhone = false;
          this.phoneValidationStatus = 'error';
          this.phoneErrorMessage =
            error?.error?.message ||
            error?.message ||
            'Error al validar el número de teléfono.';
        },
      });
  }

  onContinueFromConnections() {
    if (!this.canContinueFromConnections) return;
    this.createAgentAfterValidation();
  }

  // Crear agente
  private createAgentAfterValidation() {
    if (!canAddAnotherAgent(this.userStore.user()?.planUsage)) {
      this.isCreatingAgent = false;
      this.modalService
        .openWarning({
          message: `${this.t.planLimitModalTitle}: ${this.t.http403PlanBlocked}`,
          confirmText: this.t.planLimitModalCta,
          cancelText: this.t.cancelBtn,
        })
        .afterClosed()
        .subscribe((ok) => {
          if (ok) void this.router.navigate(['/billing']);
        });
      return;
    }

    const voiceId = this.selectedVoiceId || '';

    const agentConfig: SetAgentConfigDto = {
      name: this.agentName || 'Agente',
      language: this.selectedCountry || 'es',
      type: this.selectedCallType || 'inbound',
      twilioAccountId: Number(this.selectedTwilioAccount?.twilioAccountId ?? 0),
      voiceId: voiceId,
      firstInteraction: this.greeting || '',
      agentInstruction: this.instructions || '',
      phoneNumbers: {
        countryCode: this.selectedCountryCode || '+34',
        number: Number(this.phoneNumber) || 0,
      },
      label: `${this.agentName || 'Agente'} - ${this.selectedCountry || 'es'}`,
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
    };

    this.isCreatingAgent = true;

    this.agentsService.createAgent(agentConfig).subscribe({
      next: (response) => {
        if (this.selectedKnowledgeSourceIds.length > 0 && response?.agentId) {
          this.knowledgeBaseService
            .linkKnowledgeSourcesToAgent(response.agentId, {
              sourceIds: this.selectedKnowledgeSourceIds,
            })
            .subscribe({
              next: () =>
                console.info(
                  '✅ Fuentes de conocimiento vinculadas exitosamente',
                ),
              error: (error) =>
                console.error(
                  '❌ Error al vincular fuentes de conocimiento:',
                  error,
                ),
            });
        }
        this.isCreatingAgent = false;
        this.goToStep(11); // Ir a pantalla de bienvenida
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Error al crear agente:', error);
        this.isCreatingAgent = false;
        // Mantener paso 10 (teléfono/Twilio): volver a 9 confundía al usuario si fallaba la creación
        if (error.status === 403) {
          openPlanLimitDialog(
            this.modalService,
            this.router,
            this.i18nService,
            error,
          );
          return;
        }
        this.modalService.openError({
          title: 'Error al crear agente',
          message:
            error?.error?.message ||
            error?.message ||
            'Error al crear el agente. Por favor, intenta nuevamente.',
        });
      },
    });
  }

  // Validar si el formulario es válido
  private isFormValid(): boolean {
    return (
      this.businessName.trim() !== '' &&
      this.selectedCompanyType !== '' &&
      this.selectedEmployeeRange !== ''
    );
  }

  // Getter para verificar si el formulario es válido
  get isFormComplete(): boolean {
    return this.isFormValid();
  }

  // Getter para obtener el nombre del tipo de empresa seleccionado
  get selectedCompanyTypeName(): string {
    const type = this.companyTypes.find(
      (t) => t.id === this.selectedCompanyType,
    );
    return type ? type.name : '';
  }

  // Getter para obtener el rango de empleados seleccionado
  get selectedEmployeeRangeName(): string {
    const range = this.employeeRanges.find(
      (r) => r.id === this.selectedEmployeeRange,
    );
    return range ? range.range : '';
  }
}
