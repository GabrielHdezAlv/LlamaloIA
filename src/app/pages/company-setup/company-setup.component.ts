import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { UserStorage } from '../../storages/user/user-storage';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  AgentsService,
  GenerateAgentInstructionsRequest,
} from '../../core/services/agents.service';
import { Voice } from '../../shared/models/voice.model';
import { AiSphereComponent } from '../../shared/components/ai-sphere/ai-sphere.component';
import { TwilioService } from '../../core/services/twilio.service';

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
  imports: [CommonModule, FormsModule, MatSnackBarModule, AiSphereComponent],
  templateUrl: './company-setup.component.html',
  styleUrl: './company-setup.component.scss',
})
export class CompanySetupComponent implements OnInit, OnDestroy {
  // Servicios inyectados
  private userService = inject(UserService);
  private userStore = inject(UserStorage);
  private snackBar = inject(MatSnackBar);
  private agentsService = inject(AgentsService);
  private twilioService = inject(TwilioService);

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

  // Imagen derecha (mockup del onboarding)
  rightImageStep = 1; // 1 = zona 1, 2 = zona 2
  isRightImageFading = false;

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

  // Paso 3: Completa tu agente
  agentName = '';
  readonly agentNameMaxLength = 50;

  // Paso 4: Tipo de llamada (inbound/outbound)
  selectedCallType: 'inbound' | 'outbound' | null = null;

  // Paso 5: País y voz (10 idiomas de new-create-agents)
  countryOptions = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'Inglés Británico' },
    { code: 'fr', label: 'Francés' },
    { code: 'it', label: 'Italiano' },
    { code: 'de', label: 'Alemán' },
    { code: 'pt', label: 'Portugués' },
    { code: 'us', label: 'Inglés Americano' },
    { code: 'tr', label: 'Turco' },
    { code: 'se', label: 'Sueco' },
    { code: 'nl', label: 'Holandés' },
  ];
  selectedCountry = 'es';
  voices: { name: string; voiceId: string }[] = [];
  selectedVoiceId = '';
  currentPlayingVoice: string | null = null;
  private audioActual: HTMLAudioElement | null = null;
  private readonly VOCES_LANG_CODES = ['es', 'en', 'it', 'de', 'fr'];

  // Paso 5: Parámetros de voz (configuración del agente)
  voiceParameters = {
    stability: 0.72,
    similarity: 0.8,
    style: 0.5,
    speed: 1,
    boost: true,
  };

  // Paso 7: Instrucciones
  greeting = '';
  instructions = '';
  showMakeConfigStep7 = false;
  makeActionDataStep7 = {
    name: '',
    description: '',
    serverUrl: '',
  };

  // Paso 8: Base de conocimientos (PDF / Web)
  selectedKnowledgeSource: 'pdf' | 'web' | null = null;
  knowledgeBaseNote = '';

  showCountryDropdown = false;
  showVoiceDropdown = false;
  showVoiceParamsDropdown = false;
  hasConnectedShopify = false;

  // Paso 7: Twilio (conectar número de teléfono)
  showTwilioConfigStep7 = false;
  twilioSidStep7 = '';
  twilioTokenStep7 = '';
  isValidatingTwilioStep7 = false;
  twilioValidationStatusStep7: 'success' | 'error' | null = null;
  twilioErrorMessageStep7 = '';
  isTwilioValidated = false;
  twilioAccountsStep7: Array<{
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  }> = [];
  selectedTwilioAccount: {
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  } | null = null;
  showNewTwilioAccountFormStep7 = false;
  loadingTwilioAccounts = false;
  availablePhoneNumbers: Array<{
    phoneId: number;
    number: string;
    countryCode: string;
    twilioAccountId?: number;
  }> = [];
  loadingPhoneNumbers = false;
  phoneNumberStep7 = '';
  selectedCountryCodeStep7 = '+34';
  phoneValidationStatusStep7: 'success' | 'error' | null = null;
  phoneErrorMessageStep7 = '';
  private phoneValidationTimeoutStep7: ReturnType<typeof setTimeout> | null =
    null;

  // Paso 7: Generar instrucciones con IA (dropdown)
  showGeneratePromptModal = false;
  promptDescription = '';
  isGeneratingPrompt = false;
  generatePromptError = '';
  isGeneratePromptDropdownClosing = false;

  // Paso 7: ver instrucciones ampliadas
  showExpandInstructionsModal = false;
  isInstructionsModalClosing = false;

  // Paso 10: Prueba de agente — micrófono y esfera
  isMicrophoneActive = false;
  audioLevel = 0;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private animationFrame: number | null = null;

  constructor(private router: Router) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (
      target.closest('.country-dropdown-step5') ||
      target.closest('.voice-params-dropdown-step5') ||
      target.closest('.twilio-step7')
    )
      return;
    this.showCountryDropdown = false;
    this.showVoiceDropdown = false;
    this.showVoiceParamsDropdown = false;
  }

  ngOnInit() {
    // Aquí podrías verificar si el usuario ya completó el setup
    // Por defecto está desactivado, se activa con el botón
    this.isSetupActive = false;
    this.showWelcomeSequence = true;
    this.startWelcomeSequence();

    // Inicializar audio solo en entorno navegador para evitar errores en SSR
    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      this.clickAudio = new Audio('assets/click.mp3');
    }
    // Cargar la imagen de perfil existente del usuario
    const currentUser = this.userStore.user();
    if (currentUser?.profileImage) {
      this.logoPreview = currentUser.profileImage;
    }
  }

  ngOnDestroy() {
    this.stopMicrophone();
  }

  // Método para activar/desactivar el setup (para testing)
  toggleSetup() {
    this.isSetupActive = !this.isSetupActive;
    if (this.isSetupActive) {
      this.currentStep = 1;
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

  // Animación tras "Cómo nos conociste" -> paso 3 ya preparado mientras se anima
  startAgentIntroAnimation() {
    this.goToStep(3); // Paso 3 ya renderizado detrás del overlay
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
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      this.currentStep = 3;
    } else if (this.currentStep === 3) {
      this.currentStep = 4;
    } else if (this.currentStep === 4) {
      this.currentStep = 5;
    } else if (this.currentStep === 5) {
      this.currentStep = 6;
    } else if (this.currentStep === 6) {
      this.currentStep = 7;
    } else if (this.currentStep === 7) {
      this.currentStep = 8;
    } else if (this.currentStep === 8) {
      this.currentStep = 9;
    } else if (this.currentStep === 9) {
      this.currentStep = 10;
    } else if (this.currentStep === 10) {
      this.currentStep = 11;
    } else if (this.currentStep === 11) {
      this.completeSetup();
    }
  }

  // Método para ir hacia atrás
  goBack() {
    // Volver del paso 5 al paso 4
    if (this.currentStep === 5) {
      this.pauseVoice();
      this.goToStep(4);
      return;
    }
    // Volver del paso 6 al paso 5
    if (this.currentStep === 6) {
      this.goToStep(5);
      return;
    }
    // Volver del paso 8 al paso 7
    if (this.currentStep === 8) {
      this.goToStep(7);
      return;
    }
    // Volver del paso 7 al paso 6
    if (this.currentStep === 7) {
      this.goToStep(6);
      return;
    }
    // Volver del paso 9 al paso 8
    if (this.currentStep === 9) {
      this.goToStep(8);
      return;
    }
    // Volver del paso 11 al paso 10
    if (this.currentStep === 11) {
      this.goToStep(10);
      return;
    }
    // Volver del paso 10 al paso 9 (detener micrófono)
    if (this.currentStep === 10) {
      this.stopMicrophone();
      this.goToStep(9);
      return;
    }
    // Volver del paso 4 al paso 3
    if (this.currentStep === 4) {
      this.goToStep(3);
      return;
    }
    // Volver del paso 3 al paso 2
    if (this.currentStep === 3) {
      this.goToStep(2);
      return;
    }
    // Animación especial al volver del paso 2 al paso 1
    if (this.currentStep === 2) {
      const backFadeDuration = 300; // ms para desvanecer la zona 2

      // Iniciar fade-out del contenido de la zona 2
      this.step2ContentVisible = false;

      setTimeout(() => {
        this.goToStep(1);
      }, backFadeDuration);

      return;
    }

    this.goToStep(this.currentStep - 1);
  }

  // Método genérico para ir a un paso concreto
  goToStep(step: number) {
    if (step < 1) {
      step = 1;
    }
    if (step > this.maxStep) {
      step = this.maxStep;
    }

    const previousStep = this.currentStep;
    if (previousStep === 9 && step !== 9) {
      this.stopMicrophone();
    }
    this.currentStep = step;

    // Si se navega a la zona 2 sin venir de la animación de la zona 1,
    // aseguramos que su contenido esté visible inmediatamente.
    if (step === 2 && !this.isMainUsageAnimating) {
      this.step2ContentVisible = true;
    }

    // Transición suave de la imagen derecha entre pasos 1 y 2
    if ((step === 1 || step === 2) && step !== previousStep) {
      this.triggerRightImageTransition(step);
    }

    // Cargar voces al entrar al paso 5
    if (step === 5) {
      this.loadVoices();
    }
    // Cargar cuentas Twilio al entrar al paso 7
    if (step === 7) {
      this.loadTwilioAccountsStep7();
    }
  }

  // Ir al paso 4 (Bienvenido) desde Completa tu agente
  onCreateAgent() {
    this.goToStep(4);
  }

  onSelectCallType(type: 'inbound' | 'outbound') {
    this.selectedCallType = type;
  }

  onContinueToWelcome() {
    this.goToStep(5);
  }

  onContinueFromVoiceStep() {
    this.pauseVoice();
    this.goToStep(6);
  }

  // Paso 6: Shopify -> paso 7 Twilio
  onContinueFromShopifyStep() {
    this.goToStep(7);
  }

  // Paso 7: Instrucciones -> paso 8 Base de conocimientos
  onContinueFromInstructionsStep() {
    this.goToStep(8);
  }

  toggleMakeConfigStep7() {
    this.showMakeConfigStep7 = !this.showMakeConfigStep7;
  }

  onSaveMakeActionStep7() {
    const { name, description, serverUrl } = this.makeActionDataStep7;
    if (!name.trim() || !serverUrl.trim()) {
      this.snackBar.open(
        'Completa nombre y URL del servidor para guardar.',
        'Cerrar',
        {
          duration: 2500,
        },
      );
      return;
    }

    this.snackBar.open('Acción de Make guardada.', 'Cerrar', {
      duration: 2000,
    });
    this.showMakeConfigStep7 = false;
  }

  // Paso 8: Base de conocimientos -> paso 9 Prueba de agente
  onContinueFromKnowledgeBaseStep() {
    this.goToStep(9);
  }

  // Paso 9: Prueba de agente -> paso 10 Twilio
  onContinueFromAgentTestStep() {
    this.stopMicrophone();
    this.goToStep(10);
  }

  // Paso 10: Twilio -> paso 11 Bienvenido
  onContinueFromTwilioStep() {
    this.goToStep(11);
  }

  selectKnowledgeSource(source: 'pdf' | 'web') {
    this.selectedKnowledgeSource = source;
  }

  // Paso 7: Twilio — getter y métodos
  get isTwilioPhoneCompleteStep7(): boolean {
    return (
      this.isTwilioValidated &&
      this.phoneValidationStatusStep7 === 'success' &&
      !!this.phoneNumberStep7?.trim()
    );
  }

  toggleTwilioConfigStep7() {
    this.showTwilioConfigStep7 = !this.showTwilioConfigStep7;
  }

  onTwilioConnectButtonClickStep7(event: Event) {
    event.stopPropagation();
    if (this.showNewTwilioAccountFormStep7) {
      this.showNewTwilioAccountFormStep7 = false;
      return;
    }
    this.showTwilioConfigStep7 = !this.showTwilioConfigStep7;
  }

  loadTwilioAccountsStep7() {
    this.loadingTwilioAccounts = true;
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        this.loadingTwilioAccounts = false;
        if (
          profile.twilio &&
          Array.isArray(profile.twilio) &&
          profile.twilio.length > 0
        ) {
          this.twilioAccountsStep7 = profile.twilio.map((acc) => ({
            twilioAccountId: acc.twilioAccountId,
            twilioSid: acc.twilioSid,
            twilioToken: acc.twilioToken,
          }));
          this.showNewTwilioAccountFormStep7 = false;
        } else {
          this.twilioAccountsStep7 = [];
          this.showNewTwilioAccountFormStep7 = true;
        }
      },
      error: () => {
        this.loadingTwilioAccounts = false;
        this.twilioAccountsStep7 = [];
        this.showNewTwilioAccountFormStep7 = true;
      },
    });
  }

  useExistingTwilioAccountStep7(account: {
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  }) {
    this.selectedTwilioAccount = account;
    this.twilioSidStep7 = account.twilioSid;
    this.twilioTokenStep7 = account.twilioToken;
    this.showNewTwilioAccountFormStep7 = false;
    this.phoneValidationStatusStep7 = null;
    this.phoneErrorMessageStep7 = '';
    this.phoneNumberStep7 = '';
    this.validateTwilioConfigStep7();
    this.loadAvailablePhoneNumbersStep7();
  }

  showNewTwilioAccountStep7() {
    this.selectedTwilioAccount = null;
    this.twilioSidStep7 = '';
    this.twilioTokenStep7 = '';
    this.showNewTwilioAccountFormStep7 = true;
    this.twilioValidationStatusStep7 = null;
    this.isTwilioValidated = false;
    this.phoneValidationStatusStep7 = null;
    this.phoneNumberStep7 = '';
    this.availablePhoneNumbers = [];
  }

  backToAccountSelectionStep7() {
    this.showNewTwilioAccountFormStep7 = false;
    this.selectedTwilioAccount = null;
    this.twilioSidStep7 = '';
    this.twilioTokenStep7 = '';
    this.isTwilioValidated = false;
    this.phoneValidationStatusStep7 = null;
    this.phoneNumberStep7 = '';
    this.availablePhoneNumbers = [];
  }

  selectPhoneStep7(phone: { number: string; countryCode: string }) {
    this.phoneNumberStep7 = phone.number;
    this.selectedCountryCodeStep7 = phone.countryCode.startsWith('+')
      ? phone.countryCode
      : `+${phone.countryCode}`;
    this.validatePhoneNumberStep7();
  }

  onTwilioSidChangeStep7() {
    this.twilioValidationStatusStep7 = null;
    this.twilioErrorMessageStep7 = '';
    this.isTwilioValidated = false;
  }

  onTwilioTokenChangeStep7() {
    this.twilioValidationStatusStep7 = null;
    this.twilioErrorMessageStep7 = '';
    this.isTwilioValidated = false;
  }

  onPhoneNumberChangeStep7() {
    if (this.phoneValidationTimeoutStep7)
      clearTimeout(this.phoneValidationTimeoutStep7);
    if (!this.phoneNumberStep7?.trim()) {
      this.phoneValidationStatusStep7 = null;
      this.phoneErrorMessageStep7 = '';
      return;
    }
    if (!this.isTwilioValidated) return;
    this.phoneValidationTimeoutStep7 = setTimeout(
      () => this.validatePhoneNumberStep7(),
      500,
    );
  }

  validateTwilioConfigStep7() {
    if (!this.twilioSidStep7?.trim() || !this.twilioTokenStep7?.trim()) {
      this.snackBar.open('Completa Account SID y Auth Token.', undefined, {
        duration: 3000,
      });
      return;
    }
    this.twilioValidationStatusStep7 = null;
    this.twilioErrorMessageStep7 = '';
    this.isValidatingTwilioStep7 = true;
    const config: {
      twilioSid: string;
      twilioToken: string;
      twilioAccountId?: number;
    } = {
      twilioSid: this.twilioSidStep7.trim(),
      twilioToken: this.twilioTokenStep7.trim(),
    };
    if (this.selectedTwilioAccount)
      config.twilioAccountId = this.selectedTwilioAccount.twilioAccountId;
    this.twilioService.setConfig(config).subscribe({
      next: () => {
        this.isValidatingTwilioStep7 = false;
        this.twilioValidationStatusStep7 = 'success';
        this.isTwilioValidated = true;
        if (!this.selectedTwilioAccount) {
          this.userService.getUserProfile().subscribe({
            next: (profile) => {
              if (profile.twilio && Array.isArray(profile.twilio)) {
                const match = profile.twilio.find(
                  (acc) =>
                    acc.twilioSid === this.twilioSidStep7.trim() &&
                    acc.twilioToken === this.twilioTokenStep7.trim(),
                );
                if (match) {
                  this.selectedTwilioAccount = {
                    twilioAccountId: match.twilioAccountId,
                    twilioSid: match.twilioSid,
                    twilioToken: match.twilioToken,
                  };
                  this.loadAvailablePhoneNumbersStep7();
                }
              }
            },
          });
        } else {
          this.loadAvailablePhoneNumbersStep7();
        }
        if (this.phoneNumberStep7?.trim()) this.validatePhoneNumberStep7();
      },
      error: (err) => {
        this.isValidatingTwilioStep7 = false;
        this.twilioValidationStatusStep7 = 'error';
        this.isTwilioValidated = false;
        this.twilioErrorMessageStep7 =
          err?.error?.message ||
          err?.message ||
          'Error al validar Twilio. Revisa tus credenciales.';
      },
    });
  }

  loadAvailablePhoneNumbersStep7() {
    if (!this.selectedTwilioAccount) {
      this.availablePhoneNumbers = [];
      return;
    }
    this.loadingPhoneNumbers = true;
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        this.loadingPhoneNumbers = false;
        const allPhones = profile.phoneNumbers || [];
        const agentPhones = new Set<string>();
        if (profile.agents && Array.isArray(profile.agents)) {
          profile.agents.forEach((a) => {
            if (a.phoneNumbers)
              agentPhones.add(
                `${a.phoneNumbers.countryCode}${a.phoneNumbers.number}`,
              );
          });
        }
        this.availablePhoneNumbers = allPhones.filter(
          (p) =>
            p.twilioAccountId === this.selectedTwilioAccount!.twilioAccountId &&
            !agentPhones.has(`${p.countryCode}${p.number}`),
        );
      },
      error: () => {
        this.loadingPhoneNumbers = false;
        this.availablePhoneNumbers = [];
      },
    });
  }

  validatePhoneNumberStep7() {
    if (!this.phoneNumberStep7?.trim()) return;
    const code = this.selectedCountryCodeStep7 || '+34';
    const number = this.phoneNumberStep7.trim();
    this.phoneValidationStatusStep7 = null;
    this.phoneErrorMessageStep7 = '';
    this.twilioService
      .validatePhone(code, number, this.selectedTwilioAccount?.twilioAccountId)
      .subscribe({
        next: () => {
          this.phoneValidationStatusStep7 = 'success';
        },
        error: (err) => {
          this.phoneValidationStatusStep7 = 'error';
          this.phoneErrorMessageStep7 =
            err?.error?.message ||
            'Número no disponible. Verifica que esté en Twilio.';
        },
      });
  }

  // --- Generar instrucciones con IA (similar a new-create-agents) ---
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

    const voiceId = this.selectedVoiceId || this.selectedVoice?.voiceId || '';

    const enterpriseName =
      (this.userStore.user()?.enterprise?.name || '').trim() || 'Mi Empresa';

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

  // --- Ver instrucciones ampliadas (textarea grande) ---
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

  // Micrófono para Prueba de agente (paso 10) — esfera reacciona al audio
  async toggleMicrophone() {
    if (this.isMicrophoneActive) {
      this.stopMicrophone();
    } else {
      await this.startMicrophone();
    }
  }

  async startMicrophone() {
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      this.snackBar.open(
        'El micrófono no está disponible en este navegador.',
        undefined,
        { duration: 3000 },
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.4;
      this.analyser.minDecibels = -60;
      this.analyser.maxDecibels = -10;
      this.microphone.connect(this.analyser);
      this.isMicrophoneActive = true;
      this.animateAudioLevel();
    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      this.snackBar.open(
        'No se pudo acceder al micrófono. Revisa los permisos.',
        undefined,
        { duration: 4000 },
      );
    }
  }

  stopMicrophone() {
    if (this.animationFrame != null) {
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

  private animateAudioLevel() {
    if (!this.isMicrophoneActive || !this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const updateLevel = () => {
      this.analyser!.getByteFrequencyData(dataArray);
      let max = 0;
      for (let i = 0; i < dataArray.length; i++) {
        max = Math.max(max, dataArray[i]);
      }
      let normalizedLevel = max / 255;
      normalizedLevel = Math.min(normalizedLevel, 1.0);
      const targetLevel = normalizedLevel * 1.8;
      this.audioLevel = this.audioLevel * 0.75 + targetLevel * 0.25;
      this.audioLevel = Math.min(this.audioLevel, 3.5);
      if (this.isMicrophoneActive) {
        this.animationFrame = requestAnimationFrame(updateLevel);
      }
    };
    updateLevel();
  }

  // Botón principal para ir al onboarding específico de Shopify
  connectShopify() {
    this.hasConnectedShopify = true;
    this.router.navigate(['/shopify-onboarding']);
  }

  loadVoices() {
    this.agentsService.getVoices().subscribe({
      next: (backendVoices: Voice[]) => {
        this.voices = backendVoices.map((v) => ({
          name: v.name,
          voiceId: v.voiceId,
        }));
        if (this.voices.length > 0 && !this.selectedVoiceId) {
          this.selectedVoiceId = this.voices[0].voiceId;
        }
      },
      error: () => {
        this.voices = [];
      },
    });
  }

  selectCountry(code: string) {
    this.selectedCountry = code;
    this.showCountryDropdown = false;
  }

  selectVoice(voiceId: string) {
    this.selectedVoiceId = voiceId;
    this.showVoiceDropdown = false;
  }

  toggleCountryDropdown(event: Event) {
    event.stopPropagation();
    this.showVoiceDropdown = false;
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

  get selectedCountryOption() {
    return (
      this.countryOptions.find((c) => c.code === this.selectedCountry) ||
      this.countryOptions[0]
    );
  }

  get selectedVoice() {
    return this.voices.find((v) => v.voiceId === this.selectedVoiceId);
  }

  playVoicePreview(voice: { name: string; voiceId: string }, event: Event) {
    event.stopPropagation();
    if (this.currentPlayingVoice === voice.voiceId) {
      this.pauseVoice();
      return;
    }
    this.playVoiceInternal(voice);
  }

  playVoice() {
    const voice = this.voices.find((v) => v.voiceId === this.selectedVoiceId);
    if (!voice?.name) return;
    if (this.currentPlayingVoice === voice.voiceId) {
      this.pauseVoice();
      return;
    }
    this.playVoiceInternal(voice);
  }

  private playVoiceInternal(voice: { name: string; voiceId: string }) {
    let lang = this.selectedCountry;
    if (lang === 'us') lang = 'en';
    else if (!this.VOCES_LANG_CODES.includes(lang)) lang = 'es';
    const normalized = voice.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
    const path = `assets/voces/${normalized}_${lang}.mp3`;
    if (this.audioActual) {
      this.audioActual.pause();
      this.audioActual.currentTime = 0;
    }
    const audio = new Audio(path);
    this.audioActual = audio;
    this.currentPlayingVoice = voice.voiceId;
    audio.onended = () => {
      this.currentPlayingVoice = null;
      if (this.audioActual === audio) this.audioActual = null;
    };
    audio.onerror = () => {
      this.currentPlayingVoice = null;
      if (this.audioActual === audio) this.audioActual = null;
    };
    audio.play().catch(() => {
      this.currentPlayingVoice = null;
      if (this.audioActual === audio) this.audioActual = null;
    });
  }

  pauseVoice() {
    if (this.audioActual) {
      this.audioActual.pause();
      this.audioActual.currentTime = 0;
      this.audioActual = null;
    }
    this.currentPlayingVoice = null;
  }

  private triggerRightImageTransition(targetStep: number) {
    if (
      targetStep === this.rightImageStep ||
      (targetStep !== 1 && targetStep !== 2)
    ) {
      return;
    }

    const fadeDuration = 350; // ms
    this.isRightImageFading = true;

    setTimeout(() => {
      this.rightImageStep = targetStep;
      this.isRightImageFading = false;
    }, fadeDuration);
  }

  // Método para manejar la subida del logo
  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.showNotification(
          'Por favor, selecciona un archivo de imagen válido',
          'error',
        );
        return;
      }

      // Validar tamaño (máximo 10MB - más permisivo)
      if (file.size > 10 * 1024 * 1024) {
        this.showNotification('La imagen debe ser menor a 10MB', 'error');
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
      this.showNotification('Subiendo imagen...', 'success');

      // TEMPORAL: Mantener la imagen local sin subir al backend por ahora
      setTimeout(() => {
        this.showNotification(
          'Imagen cargada correctamente (modo local)',
          'success',
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
            this.showNotification('Logo subido correctamente', 'success');
          } else {
            console.error('Respuesta del backend sin imageUrl:', response);
            this.showNotification(
              'Error: No se recibió la URL de la imagen del servidor',
              'error',
            );
          }
        },
        error: (error: any) => {
          console.error('Error completo al subir imagen:', error);
          this.showNotification(
            `Error al subir la imagen: ${error.message || 'Error desconocido'}`,
            'error',
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
    // Aquí marcarías en el backend que el usuario completó el setup
    this.isSetupActive = false;
    this.router.navigate(['/dashboard/home']);
  }

  // Método para mostrar notificaciones
  private showNotification(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
      horizontalPosition: 'right',
      verticalPosition: 'top',
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
