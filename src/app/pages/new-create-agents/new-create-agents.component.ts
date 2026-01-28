import { Component, HostListener, OnDestroy, AfterViewChecked, ElementRef, ViewChild, OnInit, Inject, PLATFORM_ID, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Location } from '@angular/common';
import { ModalService } from '../../shared/modals/modal.service';
import { I18nService } from '../../core/services/i18n.service';
import { AgentsService } from '../../core/services/agents.service';
import { TwilioService } from '../../core/services/twilio.service';
import { Voice } from '../../shared/models/voice.model';
import { SetAgentConfigDto, VoiceParameters } from '../../shared/models/agent.model';
import lottie from 'lottie-web';

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
  savedAt: number; // timestamp
}

import { AiSphereComponent } from '../../shared/components/ai-sphere/ai-sphere.component';

@Component({
  selector: 'app-new-create-agents',
  standalone: true,
  imports: [FormsModule, CommonModule, AiSphereComponent],
  templateUrl: './new-create-agents.component.html',
  styleUrl: './new-create-agents.component.scss'
})
export class NewCreateAgentsComponent implements OnDestroy, AfterViewChecked, OnInit {
  @ViewChild('lottieContainer', { static: false }) lottieContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('countryDropdown', { static: false }) countryDropdown!: ElementRef<HTMLDivElement>;

  step: 'agentName' | 'language' | 'voices' | 'instructions' | 'actions' | 'knowledgeBase' | 'summary' | 'connectPhone' | 'advancedSettings' | 'final' | 'success' = 'agentName';

  // Popup de recuperación de borrador
  showRecoveryPopup = false;
  savedDraft: AgentDraft | null = null;

  // Add this line to declare phoneNumber
  phoneNumber = '';
  selectedCallType: 'inbound' | 'outbound' | null = null;
  label: string = ''; // Etiqueta del agente
  selectedVoiceId: string = ''; // voiceId de la voz seleccionada
  showTwilioConfig = false;
  showMakeConfig = false;
  makeActionData = {
    name: '',
    description: '',
    serverUrl: ''
  };

  // Variables para Twilio
  twilioSid = '';
  twilioToken = '';
  isValidatingTwilio = false;
  twilioValidationStatus: 'success' | 'error' | null = null;
  twilioErrorMessage = '';
  isTwilioValidated = false;
  twilioSidValidationStatus: 'success' | 'error' | null = null;
  twilioTokenValidationStatus: 'success' | 'error' | null = null;

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
  private twilioService = inject(TwilioService);
  private voicesLoaded = false;

  constructor(
    private location: Location,
    private modalService: ModalService,
    private i18nService: I18nService,
    @Inject(PLATFORM_ID) private platformId: Object
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

  ngOnInit() {
    // Verificar si hay un borrador guardado al iniciar
    this.checkForSavedDraft();

    // Iniciar animación en reposo
    if (this.isBrowser) {
      this.animateIdle();
    }
  }

  // Verificar si hay datos guardados
  private checkForSavedDraft() {
    if (!this.isBrowser) return;

    try {
      const savedData = localStorage.getItem(AGENT_DRAFT_KEY);

      if (savedData) {
        this.savedDraft = JSON.parse(savedData);

        // Verificar que el borrador tenga datos significativos
        if (this.savedDraft) {
          // Mostrar popup si está más allá del primer paso O si tiene nombre de agente
          if (this.savedDraft.step !== 'agentName' || (this.savedDraft.agentName && this.savedDraft.agentName.trim() !== '')) {
            this.showRecoveryPopup = true;
          }
        }
      }
    } catch (e) {
      console.error('Error al parsear borrador guardado:', e);
      localStorage.removeItem(AGENT_DRAFT_KEY);
    }
  }

  // Recuperar el borrador guardado
  recoverDraft() {
    if (this.savedDraft) {
      this.step = this.savedDraft.step as any;
      this.agentName = this.savedDraft.agentName || '';
      this.greeting = this.savedDraft.greeting || 'Hola, gracias por llamar a [Nombre del Negocio]. ¿En qué puedo ayudarte?';
      this.template = this.savedDraft.template || '';
      // Recuperar el tipo de llamada si existe
      this.selectedCallType = (this.savedDraft as any).selectedCallType || null;
      this.instructions = this.savedDraft.instructions || '';
      this.currentVoiceIndex = this.savedDraft.currentVoiceIndex || 0;
      this.selectedVoiceId = this.savedDraft.selectedVoiceId || '';
      this.selectedCountry = this.savedDraft.selectedCountry || 'es';
      this.selectedCountryCode = this.savedDraft.selectedCountryCode || '+34';
      this.phoneNumber = this.savedDraft.phoneNumber || '';
      this.inactivityTimeout = this.savedDraft.inactivityTimeout || 0;
      this.maxCallDuration = this.savedDraft.maxCallDuration || 0;
      this.agentSpeed = this.savedDraft.agentSpeed || 0;
      this.llmTemperature = this.savedDraft.llmTemperature || 0;
      this.isRecordingNoticeEnabled = this.savedDraft.isRecordingNoticeEnabled || false;
      this.recordingNoticeText = this.savedDraft.recordingNoticeText || 'Le informamos que esta llamada será grabada con fines de calidad y seguridad. Puede consultar más información sobre el tratamiento de sus datos en nuestra política de privacidad.';
      
      // Recuperar parámetros de voz si existen
      if (this.savedDraft.voiceParameters) {
        this.voiceParameters = { ...this.voiceParameters, ...this.savedDraft.voiceParameters };
      }

      // Si el paso es 'voices', cargar las voces del backend
      if (this.step === 'voices') {
        this.loadVoices();
      }

      if (this.step === 'summary') {
        this.animateIdle();
      }

      // Si el paso recuperado es 'summary', mostrar datos guardados
      if (this.step === 'summary') {
        // Usar setTimeout para asegurar que el componente esté completamente inicializado
        setTimeout(() => {
          this.logSavedData();
        }, 100);
      }
    }
    this.showRecoveryPopup = false;
  }

  // Descartar el borrador y empezar de nuevo
  discardDraft() {
    this.clearSavedDraft();
    this.showRecoveryPopup = false;
  }

  // Guardar el estado actual en localStorage
  saveDraft() {
    if (!this.isBrowser) return;

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
          speed: this.voiceParameters.speed
        },
        savedAt: Date.now()
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

    const stepNames: Record<string, string> = {
      'agentName': 'Nombre y Tipo',
      // 'callType': 'Tipo de llamada', // Eliminado
      'language': 'Idioma',
      'voices': 'Voces',
      'instructions': 'Instrucciones',
      'actions': 'Acciones',
      'knowledgeBase': 'Base de conocimientos',
      'advancedSettings': 'Configuración avanzada',
      'summary': 'Resumen',
      'connectPhone': 'Conectar teléfono'
    };

    return stepNames[this.savedDraft.step] || this.savedDraft.step;
  }

  greeting = 'Hola, gracias por llamar a [Nombre del Negocio]. ¿En qué puedo ayudarte?';
  template = '';
  instructions = '';
  showExpandInstructionsModal = false;

  openExpandInstructionsModal() {
    this.showExpandInstructionsModal = true;
  }

  closeExpandInstructionsModal() {
    this.showExpandInstructionsModal = false;
  }
  agentName: string = '';

  // Modal de generar prompt con IA
  showGeneratePromptModal = false;
  promptDescription = '';

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
  voices = [
    { id: 'carla', name: 'Carla', image: 'assets/carla_prueba.webp', description: 'Diseñadora de Producto enfocada en simplicidad y usabilidad.', badgeText: 'Top 1% Voz' },
    { id: 'carlos', name: 'Carlos', image: 'assets/carlos_prueba.webp', description: 'Especialista en Soporte Técnico con tono calmado y resolutivo.', badgeText: 'Top 5% Voz' },
    { id: 'david', name: 'David', image: 'assets/david_prueba.webp', description: 'Ejecutivo de Ventas con energía y capacidad de persuasión.', badgeText: 'Top Ventas' },
    { id: 'jesus', name: 'Jesús', image: 'assets/jesus_prueba.webp', description: 'Asistente Virtual amigable ideal para recepción de llamadas.', badgeText: 'Popular' },
    { id: 'claudia', name: 'Claudia', image: 'assets/claudia_prueba.webp', description: 'Narradora profesional perfecta para contenido educativo.', badgeText: 'Nueva' },
    { id: 'maria', name: 'María', image: 'assets/maria_prueba.webp', description: 'Agente de atención al cliente con gran empatía y paciencia.', badgeText: 'Destacada' }
  ];

  // Método para cargar las voces del backend
  private loadVoices() {
    // Solo cargar si no se han cargado antes
    if (this.voicesLoaded) {
      return;
    }

    this.agentsService.getVoices().subscribe({
      next: (backendVoices: Voice[]) => {
        // Mapear las voces del backend al formato esperado por el componente
        const mappedVoices = backendVoices.map((voice: Voice) => {
          // Buscar si existe una voz con el mismo nombre en las voces por defecto para mantener imagen y descripción
          const defaultVoice = this.voices.find(v => v.name.toLowerCase() === voice.name.toLowerCase());

          return {
            id: defaultVoice?.id || voice.voiceId, // Mantener el id original si existe, sino usar voiceId
            voiceId: voice.voiceId, // Agregar el voiceId del backend
            name: voice.name,
            image: defaultVoice?.image || '',
            isCustom: false,
            description: defaultVoice?.description || `Voz ${voice.name}`,
            badgeText: defaultVoice?.badgeText || ''
          };
        });

        // Agregar las voces del backend
        this.voices = mappedVoices;

        this.voicesLoaded = true;
      },
      error: (error) => {
        console.error('Error al cargar las voces:', error);
        // Mantener las voces por defecto en caso de error
      }
    });
  }

  onSelectCallType(type: 'inbound' | 'outbound') {
    // Si ya está seleccionado, deseleccionar; si no, seleccionar
    this.selectedCallType = this.selectedCallType === type ? null : type;
  }

  private pendingLanguageSelection: string | null = null;

  // Método helper para verificar si un idioma está seleccionado
  isLanguageSelected(languageCode: string): boolean {
    return this.selectedCountry === languageCode && this.pendingLanguageSelection === languageCode;
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
    const isLanguageButton = target.closest('button.group') || target.closest('button[class*="flex flex-col"]');
    // Si no fue en un botón de idioma, limpiar la selección pendiente
    if (!isLanguageButton) {
      this.clearPendingLanguageSelection();
    }
  }

  onLanguageSelected(languageCode: string = 'es', countryCode: string = '+34', event?: Event) {
    // Prevenir la propagación del evento para evitar que se limpie la selección
    if (event) {
      event.stopPropagation();
    }
    // Si el idioma clickeado ya está seleccionado y hay una selección pendiente, es el segundo click
    if (this.pendingLanguageSelection && 
        this.selectedCountry === languageCode &&
        this.pendingLanguageSelection === languageCode) {
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
      const voiceIndex = this.voices.findIndex(v => 
        (v as any)?.voiceId === this.selectedVoiceId || v.id === this.selectedVoiceId
      );
      if (voiceIndex !== -1) {
        this.currentVoiceIndex = voiceIndex;
      }
    } else {
      // Si no se pasa parámetro, usar la voz actual según el índice
      const currentVoice = this.getCurrentVoice();
      if (currentVoice) {
        this.selectedVoiceId = (currentVoice as any)?.voiceId || currentVoice.id || '';
      }
    }
    this.isSidebarOpen = true;
  }

  confirmVoiceSelection() {
    // Asegurar que el voiceId esté guardado antes de continuar
    if (!this.selectedVoiceId) {
      const currentVoice = this.getCurrentVoice();
      if (currentVoice) {
        this.selectedVoiceId = (currentVoice as any)?.voiceId || currentVoice.id || '';
      }
    }
    this.pauseVoice();
    this.isSidebarOpen = false;
    this.step = 'instructions';
    this.saveDraft();
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
    const maxPageIndex = Math.max(Math.ceil(this.voices.length / visibleCount) - 1, 0);
    const currentPage = Math.floor(this.currentVoiceIndex / visibleCount);

    if (currentPage < maxPageIndex) {
      // Avanzar a la siguiente página (3 voces)
      this.currentVoiceIndex = Math.min((currentPage + 1) * visibleCount, this.voices.length - 1);
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
    const maxPageIndex = Math.max(Math.ceil(this.voices.length / visibleCount) - 1, 0);
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
    this.tabletPageIndex = Math.min(this.tabletPageIndex, this.getTabletTotalPages() - 1);
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
    const maxPageIndex = Math.max(Math.ceil(this.voices.length / visibleCount) - 1, 0);
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
    this.tabletPageIndex = Math.min(Math.max(pageIndex, 0), this.getTabletTotalPages() - 1);
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
    if (this.step === 'summary') {
      this.step = 'actions'; // Volver a "Conexiones" desde "Prueba Agente"
    } else if (this.step === 'knowledgeBase') {
      this.step = 'instructions';
    } else if (this.step === 'actions') {
      this.step = 'instructions';
    } else if (this.step === 'instructions') {
      this.step = 'voices';
      this.loadVoices();
    } else if (this.step === 'voices') {
      this.pauseVoice();
      this.step = 'language';
    } else if (this.step === 'language') {
      this.step = 'agentName';
    } else if (this.step === 'agentName') {
      // Primer paso: volver a la pantalla anterior
      this.location.back();
    }
    // Si ya está en 'final' o 'success', no hace nada
  }

  onSkip() {
    if (this.step === 'agentName') {
      this.step = 'language';
    } else if (this.step === 'language') {
      this.step = 'voices';
      this.loadVoices();
    } else if (this.step === 'voices') {
      this.pauseVoice();
      this.step = 'instructions';
    } else if (this.step === 'instructions') {
      this.step = 'actions'; // Ir a "Añadir Acciones"
    } else if (this.step === 'actions') {
      this.step = 'summary';
    } else if (this.step === 'knowledgeBase') {
      this.step = 'summary';
    } else if (this.step === 'summary') {
      // Avanzar directamente a crear el agente
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
    this.step = 'language';
    this.saveDraft();
  }

  /** Códigos de idioma con muestras en assets/voces (nombre_idioma.mp3). */
  private readonly VOCES_LANG_CODES: readonly string[] = ['es', 'en', 'it', 'de', 'fr'];

  playVoice(voice: { id?: string; name?: string }) {
    const voiceId = (voice?.id ?? '').toString().toLowerCase();
    if (!voiceId) return;

    if (this.isPlaying && this.currentPlayingVoice === voiceId) {
      this.pauseVoice();
      return;
    }

    const lang = this.VOCES_LANG_CODES.includes(this.selectedCountry)
      ? this.selectedCountry
      : 'es';
    const path = `assets/voces/${voiceId}_${lang}.mp3`;

    if (this.audioActual) {
      this.audioActual.pause();
      this.audioActual.currentTime = 0;
    }

    const audio = new Audio(path);
    this.audioActual = audio;
    this.isPlaying = true;
    this.currentPlayingVoice = voiceId;

    audio.play().catch(err => {
      console.error('Error al reproducir audio:', err);
      this.isPlaying = false;
      this.currentPlayingVoice = null;
      this.modalService.openError({
        title: 'Error de audio',
        message: 'No se pudo reproducir el audio',
        details: String(err)
      });
    });

    audio.onended = () => {
      this.isPlaying = false;
      this.currentPlayingVoice = null;
      if (this.audioActual === audio) {
        this.audioActual = null;
      }
    };

    audio.onerror = () => {
      console.error('Error al cargar el audio:', path);
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
    this.step = 'actions'; // Ir a "Añadir Acciones"
    this.saveDraft();
  }

  selectAction(platform: string) {
    if (platform === 'shopify') {
      // Avanzar directamente sin modal (el modal ha sido eliminado)
      this.step = 'knowledgeBase';
      this.saveDraft();
    } else if (platform === 'make') {
      // Toggle del desplegable de Make (ya no se usa modal)
      this.showMakeConfig = !this.showMakeConfig;
    } else {
      // Para otras plataformas, continuar normalmente (actualmente ninguna excepto manual/omitir)
      this.step = 'knowledgeBase';
    }
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
    if (!this.twilioSid || !this.twilioToken || !this.twilioSid.trim() || !this.twilioToken.trim()) {
      this.modalService.openError({
        title: 'Campos requeridos',
        message: 'Por favor, completa tanto el Account SID como el Auth Token antes de validar.'
      });
      return;
    }

    // Resetear estado previo
    this.twilioValidationStatus = null;
    this.twilioErrorMessage = '';
    this.twilioSidValidationStatus = null;
    this.twilioTokenValidationStatus = null;
    this.isValidatingTwilio = true;

    // Llamar al endpoint de validación
    this.twilioService.setConfig({
      twilioSid: this.twilioSid.trim(),
      twilioToken: this.twilioToken.trim()
    }).subscribe({
      next: (response) => {
        this.isValidatingTwilio = false;
        this.twilioValidationStatus = 'success';
        this.twilioSidValidationStatus = 'success';
        this.twilioTokenValidationStatus = 'success';
        this.isTwilioValidated = true;
        
        // Si ya hay un número de teléfono ingresado, validarlo automáticamente
        if (this.phoneNumber && this.phoneNumber.trim()) {
          this.validatePhoneNumber();
        }
      },
      error: (error) => {
        this.isValidatingTwilio = false;
        this.twilioValidationStatus = 'error';
        this.twilioSidValidationStatus = 'error';
        this.twilioTokenValidationStatus = 'error';
        this.isTwilioValidated = false;
        
        // Extraer mensaje de error
        let errorMessage = 'Error al validar la configuración de Twilio. Por favor, verifica tus credenciales.';
        
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (error.status === 401) {
          errorMessage = 'Credenciales inválidas. Por favor, verifica tu Account SID y Auth Token.';
        } else if (error.status === 400) {
          errorMessage = 'Datos inválidos. Por favor, verifica el formato de tus credenciales.';
        }
        
        this.twilioErrorMessage = errorMessage;
        console.error('❌ Error al validar configuración de Twilio:', error);
      }
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

  // Getter para verificar si el botón Continuar debe estar habilitado
  get canContinueFromConnections(): boolean {
    // Si Make está abierto, siempre se puede continuar
    if (this.showMakeConfig) {
      return true;
    }
    // Si solo Twilio está abierto, requiere validación completa
    if (this.showTwilioConfig && !this.showMakeConfig) {
      return this.isTwilioCompletelyValidated;
    }
    // Si ninguno está abierto, verificar si Twilio está validado (incluso con acordeón cerrado)
    if (!this.showMakeConfig && !this.showTwilioConfig) {
      return this.isTwilioCompletelyValidated;
    }
    return false;
  }

  // Método para continuar desde la sección de conexiones
  onContinueFromConnections() {
    // Verificar si se puede continuar usando el getter
    if (!this.canContinueFromConnections) {
      return;
    }
    
    // Avanzar al siguiente paso
    this.step = 'summary';
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
  private validatePhoneNumber() {
    if (!this.phoneNumber || !this.phoneNumber.trim()) {
      return;
    }

    const countryCode = this.selectedCountryCode || '+34';
    const number = this.phoneNumber.trim();
    
    // Resetear estado previo
    this.phoneValidationStatus = null;
    this.phoneErrorMessage = '';
    this.isValidatingPhone = true;

    // Llamar al endpoint de validación
    this.twilioService.validatePhone(countryCode, number).subscribe({
      next: (response) => {
        this.isValidatingPhone = false;
        this.phoneValidationStatus = 'success';
      },
      error: (error) => {
        this.isValidatingPhone = false;
        this.phoneValidationStatus = 'error';
        
        // Extraer mensaje de error
        let errorMessage = 'Error al validar el número de teléfono. Por favor, intenta nuevamente.';
        
        if (error.status === 400) {
          errorMessage = error?.error?.message || 'Número no disponible. Por favor, verifica que el número sea correcto y esté disponible en Twilio.';
        } else if (error.status === 401) {
          errorMessage = 'Token inválido o expirado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 404) {
          errorMessage = 'Usuario no encontrado o configuración de Twilio no encontrada. Por favor, verifica tu configuración.';
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.phoneErrorMessage = errorMessage;
        console.error('❌ Error al validar número:', error);
      }
    });
  }

  // Propiedades para documentos PDF
  uploadedDocuments: File[] = [];
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  // ✅ Nuevos métodos para la pantalla de Base de Conocimientos
  selectKnowledgeSource(source: 'pdf' | 'web') {
    if (source === 'web') {
      // Abrir modal de Web
      const dialogRef = this.modalService.openWeb({
        title: 'Web',
      });

      dialogRef.afterClosed().subscribe(result => {
      });
    } else if (source === 'pdf') {
      // Abrir selector de archivos para PDF
      this.openFileSelector();
    } else {
      // Para otros casos, avanzar automáticamente a resumen
      this.step = 'summary';
    }
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
            message: `Solo puedes subir un máximo de 2 archivos. Se agregaron ${filesToAdd.length} de ${newFiles.length} archivos seleccionados.`
          });
        }
      } else {
        // Si ya se alcanzó el límite, mostrar modal
        this.modalService.openWarning({
          title: 'Límite alcanzado',
          message: 'Solo puedes subir 2 documentos. Por favor, elimina algunos antes de agregar nuevos.'
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
    this.step = 'summary'; // Pasa a resumen
    this.saveDraft();
  }

  onSubmitTestCall() {
    // Avanza directamente a crear el agente
    this.createAgentAfterValidation();
    this.saveDraft();
    // Mostrar datos guardados cuando llegamos a esta pantalla
    this.logSavedData();
  }

  // Método para mostrar datos guardados
  private logSavedData() {
    const currentVoice = this.getCurrentVoice();
    // Usar el voiceId guardado cuando se seleccionó la voz, o obtenerlo de la voz actual como fallback
    const voiceId = this.selectedVoiceId || (currentVoice ? ((currentVoice as any)?.voiceId || currentVoice.id) : null);
    const savedData = {
      agentName: this.agentName,
      selectedCallType: this.selectedCallType,
      language: this.selectedCountry, // Código del país como idioma
      voice: currentVoice ? {
        name: currentVoice.name,
        voiceId: voiceId
      } : null,
      greeting: this.greeting,
      instructions: this.instructions,
      phoneNumber: this.phoneNumber,
      selectedCountryCode: this.selectedCountryCode,
      label: this.label
    };
  }

  // Métodos para conectar número de teléfono
  onConnectPhone() {
    // Validar datos requeridos
    if (!this.phoneNumber || !this.phoneNumber.trim()) {
      this.modalService.openError({
        title: 'Número de teléfono requerido',
        message: 'Por favor, ingresa un número de teléfono válido.'
      });
      return;
    }

    if (!this.selectedVoiceId) {
      const currentVoice = this.getCurrentVoice();
      if (!currentVoice) {
        this.modalService.openError({
          title: 'Voz no seleccionada',
          message: 'Por favor, selecciona una voz para el agente.'
        });
        return;
      }
    }

    const countryCode = this.selectedCountryCode || '+34';
    const number = this.phoneNumber.trim();

    // Primero validar el número de teléfono
    this.twilioService.validatePhone(countryCode, number).subscribe({
      next: (response) => {
        // Si la validación es exitosa, proceder a crear el agente
        this.createAgentAfterValidation();
      },
      error: (error) => {
        console.error('❌ Error al validar número:', error);
        
        // Manejar diferentes tipos de errores
        let errorMessage = 'Error al validar el número de teléfono. Por favor, intenta nuevamente.';
        
        if (error.status === 400) {
          errorMessage = error?.error?.message || 'Número no disponible. Por favor, verifica que el número sea correcto y esté disponible en Twilio.';
        } else if (error.status === 401) {
          errorMessage = 'Token inválido o expirado. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 404) {
          errorMessage = 'Usuario no encontrado o configuración de Twilio no encontrada. Por favor, verifica tu configuración en Ajustes > Conexiones > Twilio.';
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.modalService.openError({
          title: 'Error al validar número',
          message: errorMessage
        });
      }
    });
  }

  // Método para crear el agente después de validar el número
  private createAgentAfterValidation() {
    // Construir el objeto que se enviará al endpoint
    // Usar el voiceId guardado cuando se seleccionó la voz, o obtenerlo de la voz actual como fallback
    const voiceId = this.selectedVoiceId || (() => {
      const currentVoice = this.getCurrentVoice();
      return (currentVoice as any)?.voiceId || currentVoice?.id || '';
    })();
    
    const agentConfig: SetAgentConfigDto = {
      name: this.agentName || 'Agente',
      language: this.selectedCountry || 'es', // Usar código del país como idioma
      type: this.selectedCallType || 'inbound',
      voiceId: voiceId,
      firstInteraction: this.greeting || '',
      agentInstruction: this.instructions || '',
      phoneNumbers: {
        countryCode: this.selectedCountryCode || '+34',
        number: Number(this.phoneNumber) || 0
      },
      label: this.label || `${this.agentName || 'Agente'} - ${this.selectedCountry || 'es'}`,
      parameters: {
        stability: this.voiceParameters.stability,
        similarity: this.voiceParameters.similarity,
        style: this.voiceParameters.style,
        boost: this.voiceParameters.boost,
        speed: this.voiceParameters.speed
      },
      state: "Activo"
    };
    
    // Navegar a pantalla de carga
    this.step = 'final';

    // Enviar petición al backend
    this.agentsService.createAgent(agentConfig).subscribe({
      next: (response) => {
        // Cambiar a pantalla de éxito
        this.step = 'success';
        // Limpiar el borrador cuando el agente se crea con éxito
        this.clearSavedDraft();
      },
      error: (error) => {
        console.error('❌ Error al crear agente:', error);
        // Volver a la pantalla de prueba agente
        this.step = 'summary';
        // Mostrar mensaje de error
        const errorMessage = error?.error?.message || error?.message || 'Error al crear el agente. Por favor, intenta nuevamente.';
        this.modalService.openError({
          title: 'Error al crear agente',
          message: errorMessage
        });
      }
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

  selectCountry(countryCode: string, code: string, flagColor1: string, flagColor2: string) {
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

  updateFlag(countryCode: string) {
    const flagSvg = document.getElementById('current-flag');
    if (!flagSvg) return;

    // Limpiar el contenido anterior
    flagSvg.innerHTML = '';

    switch (countryCode) {
      case 'es':
        flagSvg.innerHTML = '<rect width="20" height="12" fill="#C60B1E"/><rect y="3" width="20" height="6" fill="#FFC400"/>';
        break;
      case 'us':
        flagSvg.innerHTML = '<rect width="20" height="12" fill="#00247D"/><path d="M0 0L20 12M20 0L0 12" stroke="#FFF" stroke-width="2"/><path d="M0 0L20 12M20 0L0 12" stroke="#CF142B" stroke-width="1"/><rect x="8" width="4" height="12" fill="#FFF"/><rect y="4" width="20" height="4" fill="#FFF"/><rect x="8.8" width="2.4" height="12" fill="#CF142B"/><rect y="5.2" width="20" height="1.6" fill="#CF142B"/>';
        break;
      case 'fr':
        flagSvg.innerHTML = '<rect width="20" height="12" fill="#fff"/><rect width="6.66" height="12" fill="#0055A4"/><rect x="13.33" width="6.67" height="12" fill="#EF4135"/>';
        break;
      case 'de':
        flagSvg.innerHTML = '<rect width="20" height="12" fill="#FFCE00"/><rect y="6" width="20" height="6" fill="#DD0000"/><rect y="4" width="20" height="4" fill="#000"/>';
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
    const dropdown = target.closest('[class*="w-28"]') || target.closest('[class*="w-36"]');
    const menu = target.closest('ul');
    const menuItem = target.closest('li');

    // Solo cerrar si el click fue fuera del dropdown y del menú
    if (!dropdown && !menu && !menuItem) {
      this.showCountryMenu = false;
    }
  }

  // Nuevas propiedades
  inactivityTimeout = 0;           // Tiempo de inactividad en segundos
  maxCallDuration = 0;            // Duración máxima en segundos
  agentSpeed = 0;                 // Rapidez del agente
  llmTemperature = 0;             // Temperatura del LLM
  isRecordingNoticeEnabled = false;
  recordingNoticeText = 'Le informamos que esta llamada será grabada con fines de calidad y seguridad. Puede consultar más información sobre el tratamiento de sus datos en nuestra política de privacidad.';

  // Parámetros de voz
  voiceParameters: VoiceParameters = {
    stability: 0.72,      // 0-1.0
    similarity: 0.8,      // 0-1.0
    style: 0.5,           // 0-1.0
    boost: true,          // true/false
    speed: 0.98           // 0.25-4.0
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
    this.modalService.openWarning({
      title: 'Información sobre el mensaje de aviso de grabación',
      message: 'El mensaje de aviso de grabación es una notificación que se reproduce al inicio de las llamadas para informar a los interlocutores que la conversación será grabada. Este mensaje cumple con los requisitos legales de protección de datos y privacidad.',
      confirmText: 'Entendido',
      showCancelButton: false
    });
  }

  // Método para formatear el tiempo en formato legible
  formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes} ${remainingSeconds}` : `${minutes}`;
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
      this.modalService.openError({
        title: 'Valor inválido',
        message: 'El tiempo de inactividad debe estar entre 0 y 300 segundos',
      });
      return false;
    }

    if (this.maxCallDuration < 60 || this.maxCallDuration > 3600) {
      this.modalService.openError({
        title: 'Valor inválido',
        message: 'La duración máxima debe estar entre 60 y 3600 segundos',
      });
      return false;
    }

    return true;
  }

  onSubmitAdvancedSettings() {
    if (this.validateAdvancedSettings()) {
      // Cambia a prueba de agente
      this.step = 'summary';
      this.animateIdle();
      this.saveDraft();
    }
  }

  // Método para saltar la configuración avanzada
  onSkipAdvancedSettings() {
    // Avanza a prueba de agente
    this.step = 'summary';
    this.animateIdle();
  }

  // Método para finalizar el proceso
  onFinish() {
    // Limpiar el micrófono si está activo
    this.stopMicrophone();
    // Vuelve a la página anterior (por ejemplo, /dashboard/agents)
    this.location.back();
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
          sampleRate: 44100
        }
      });

      // Crear contexto de audio optimizado
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
      this.modalService.openError({
        title: 'Error de micrófono',
        message: 'No se pudo acceder al micrófono. Por favor, verifica los permisos.'
      });
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
      if (!this.isBrowser || this.isMicrophoneActive || this.step !== 'summary') {
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
    if (this.step === 'final' && this.lottieContainer && !this.lottieInitialized) {
      this.initLottie();
    } else if (this.step !== 'final' && this.lottieInitialized) {
      // Limpiar Lottie si cambiamos de step
      this.destroyLottie();
    }
  }

  initLottie() {
    if (this.lottieContainer && this.lottieContainer.nativeElement && !this.lottieInstance) {
      this.lottieInstance = lottie.loadAnimation({
        container: this.lottieContainer.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'assets/Loading.json'
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
    // Limpiar timeout de validación de teléfono si existe
    if (this.phoneValidationTimeout) {
      clearTimeout(this.phoneValidationTimeout);
    }
    // Limpiar el micrófono cuando se destruye el componente
    this.stopMicrophone();
    // Limpiar Lottie
    this.destroyLottie();
  }

  // Métodos para calcular tamaños y posiciones dinámicas estilo ChatGPT
  getWaveSize(waveNumber: number): number {
    const baseSize = 120;
    const increment = waveNumber * 40;
    return baseSize + increment;
  }

  getCloudSize(cloudNumber: number): number {
    const baseSize = 30 + cloudNumber * 15;
    return baseSize + (this.audioLevel * 20);
  }

  getCloudPosition(cloudNumber: number): { x: number, y: number } {
    const centerOffset = 60;
    const angle = (cloudNumber * 120) + (this.audioLevel * 30);
    const radius = 80 + (this.audioLevel * 40);

    return {
      x: Math.cos(angle * Math.PI / 180) * radius - centerOffset,
      y: Math.sin(angle * Math.PI / 180) * radius - centerOffset
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
    return Math.min(baseSize + increment + (this.audioLevel * 20), sphereSize * 0.8);
  }

  getInternalWavePosition(waveNumber: number): { x: number, y: number } {
    const sphereSize = this.getMainSphereSize();
    const centerOffset = sphereSize / 2;
    const angle = (waveNumber * 120) + (this.audioLevel * 45);
    const radius = sphereSize * 0.15 + (this.audioLevel * 15);

    return {
      x: Math.cos(angle * Math.PI / 180) * radius,
      y: Math.sin(angle * Math.PI / 180) * radius
    };
  }

  getInternalCloudSize(cloudNumber: number): number {
    const sphereSize = this.getMainSphereSize();
    const baseSize = sphereSize * 0.15 + cloudNumber * (sphereSize * 0.05);
    return baseSize + (this.audioLevel * 15);
  }

  getInternalCloudPosition(cloudNumber: number): { x: number, y: number } {
    const sphereSize = this.getMainSphereSize();
    const angle = (cloudNumber * 180) + (this.audioLevel * 60);
    const radius = sphereSize * 0.2 + (this.audioLevel * 10);

    return {
      x: Math.cos(angle * Math.PI / 180) * radius,
      y: Math.sin(angle * Math.PI / 180) * radius
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

  onMaxCallDurationChange() {
  }

  // Métodos para efectos del video del mar
  getVideoFilter(): string {
    const brightness = 1 + (this.audioLevel * 0.6);
    const contrast = 1 + (this.audioLevel * 0.4);
    const saturation = 1 + (this.audioLevel * 0.8);

    return `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${this.audioLevel * 1.2}px)`;
  }

  getVideoTransform(): string {
    const scale = 1 + (this.audioLevel * 0.2);
    const rotation = this.audioLevel * 15; // Rotación más pronunciada

    return `scale(${scale}) rotate(${rotation}deg)`;
  }

  getVideoOpacity(): number {
    return 0.7 + (this.audioLevel * 0.3);
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
    const intensity = 1 + (this.audioLevel * 0.6);
    return `radial-gradient(circle at center, 
     rgba(59, 130, 246, ${0.9 * intensity}) 0%, 
     rgba(147, 197, 253, ${0.7 * intensity}) 30%, 
     rgba(255, 255, 255, ${0.5 * intensity}) 60%, 
     rgba(30, 64, 175, ${0.8 * intensity}) 100%)`;
  }

  // Métodos para el modal de generar prompt
  openGeneratePromptModal() {
    this.showGeneratePromptModal = true;
    this.promptDescription = '';
  }

  closeGeneratePromptModal() {
    this.showGeneratePromptModal = false;
    this.promptDescription = '';
  }

  generatePrompt() {
    // Aquí iría la lógica para generar el prompt con IA
    // Por ahora, simplemente cerramos el modal
    // TODO: Implementar la llamada a la API de IA
    this.closeGeneratePromptModal();
  }

  onSkipConnectPhone() {
    this.step = 'final';
    this.saveDraft();
  }

}