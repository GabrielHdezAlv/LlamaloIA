import { Component, HostListener, OnDestroy, AfterViewChecked, ElementRef, ViewChild, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Location } from '@angular/common';
import { ModalService } from '../../shared/modals/modal.service';
import { I18nService } from '../../core/services/i18n.service';
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
  selectedCountry: string;
  selectedCountryCode: string;
  phoneNumber: string;
  inactivityTimeout: number;
  maxCallDuration: number;
  agentSpeed: number;
  llmTemperature: number;
  isRecordingNoticeEnabled: boolean;
  recordingNoticeText: string;
  savedAt: number; // timestamp
}

@Component({
  selector: 'app-new-create-agents',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './new-create-agents.component.html',
  styleUrl: './new-create-agents.component.scss'
})
export class NewCreateAgentsComponent implements OnDestroy, AfterViewChecked, OnInit {
  @ViewChild('lottieContainer', { static: false }) lottieContainer!: ElementRef<HTMLDivElement>;

  step: 'agentName' | 'callType' | 'language' | 'voices' | 'instructions' | 'actions' | 'knowledgeBase' | 'summary' | 'connectPhone' | 'advancedSettings' | 'final' | 'success' = 'agentName';

  // Popup de recuperación de borrador
  showRecoveryPopup = false;
  savedDraft: AgentDraft | null = null;

  // Add this line to declare phoneNumber
  phoneNumber = '';

  private lottieInstance: any = null;
  private lottieInitialized = false;
  private isBrowser: boolean;

  // Estado del sidebar
  isSidebarOpen: boolean = false;

  constructor(
    private location: Location,
    private modalService: ModalService,
    private i18nService: I18nService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
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
      console.log('Borrador guardado encontrado:', savedData);

      if (savedData) {
        this.savedDraft = JSON.parse(savedData);
        console.log('Borrador parseado:', this.savedDraft);

        // Verificar que el borrador tenga datos significativos
        if (this.savedDraft) {
          // Mostrar popup si está más allá del primer paso O si tiene nombre de agente
          if (this.savedDraft.step !== 'agentName' || (this.savedDraft.agentName && this.savedDraft.agentName.trim() !== '')) {
            console.log('Mostrando popup de recuperación');
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
      this.instructions = this.savedDraft.instructions || '';
      this.currentVoiceIndex = this.savedDraft.currentVoiceIndex || 0;
      this.selectedCountry = this.savedDraft.selectedCountry || 'es';
      this.selectedCountryCode = this.savedDraft.selectedCountryCode || '+34';
      this.phoneNumber = this.savedDraft.phoneNumber || '';
      this.inactivityTimeout = this.savedDraft.inactivityTimeout || 0;
      this.maxCallDuration = this.savedDraft.maxCallDuration || 0;
      this.agentSpeed = this.savedDraft.agentSpeed || 0;
      this.llmTemperature = this.savedDraft.llmTemperature || 0;
      this.isRecordingNoticeEnabled = this.savedDraft.isRecordingNoticeEnabled || false;
      this.recordingNoticeText = this.savedDraft.recordingNoticeText || 'Le informamos que esta llamada será grabada con fines de calidad y seguridad. Puede consultar más información sobre el tratamiento de sus datos en nuestra política de privacidad.';

      if (this.step === 'summary') {
        this.animateIdle();
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
        selectedCountry: this.selectedCountry,
        selectedCountryCode: this.selectedCountryCode,
        phoneNumber: this.phoneNumber,
        inactivityTimeout: this.inactivityTimeout,
        maxCallDuration: this.maxCallDuration,
        agentSpeed: this.agentSpeed,
        llmTemperature: this.llmTemperature,
        isRecordingNoticeEnabled: this.isRecordingNoticeEnabled,
        recordingNoticeText: this.recordingNoticeText,
        savedAt: Date.now()
      };

      localStorage.setItem(AGENT_DRAFT_KEY, JSON.stringify(draft));
      console.log('Borrador guardado:', draft);
    } catch (e) {
      console.error('Error al guardar borrador:', e);
    }
  }

  // Limpiar el borrador guardado
  clearSavedDraft() {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(AGENT_DRAFT_KEY);
      console.log('Borrador eliminado');
    } catch (e) {
      console.error('Error al eliminar borrador:', e);
    }
  }

  // Obtener texto del paso guardado para mostrar en el popup
  getSavedStepText(): string {
    if (!this.savedDraft) return '';

    const stepNames: Record<string, string> = {
      'agentName': 'Nombre del agente',
      'callType': 'Tipo de llamada',
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
    { id: 'custom', name: 'Clonar voz', image: '', isCustom: true, description: '', badgeText: '' },
    { id: 'carla', name: 'Carla', image: 'assets/carla_prueba.webp', description: 'Diseñadora de Producto enfocada en simplicidad y usabilidad.', badgeText: 'Top 1% Voz' },
    { id: 'carlos', name: 'Carlos', image: 'assets/carlos_prueba.webp', description: 'Especialista en Soporte Técnico con tono calmado y resolutivo.', badgeText: 'Top 5% Voz' },
    { id: 'david', name: 'David', image: 'assets/david_prueba.webp', description: 'Ejecutivo de Ventas con energía y capacidad de persuasión.', badgeText: 'Top Ventas' },
    { id: 'jesus', name: 'Jesús', image: 'assets/jesus_prueba.webp', description: 'Asistente Virtual amigable ideal para recepción de llamadas.', badgeText: 'Popular' },
    { id: 'claudia', name: 'Claudia', image: 'assets/claudia_prueba.webp', description: 'Narradora profesional perfecta para contenido educativo.', badgeText: 'Nueva' },
    { id: 'maria', name: 'María', image: 'assets/maria_prueba.webp', description: 'Agente de atención al cliente con gran empatía y paciencia.', badgeText: 'Destacada' }
  ];


  onSelect(type: 'inbound' | 'outbound') {
    this.step = 'language';
    this.saveDraft();
  }

  onLanguageSelected() {
    this.step = 'voices';
    this.saveDraft();
  }

  onVoiceSelected() {
    this.isSidebarOpen = true;
  }

  confirmVoiceSelection() {
    this.isSidebarOpen = false;
    this.step = 'instructions';
    this.saveDraft();
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  createCustomVoice() {
    console.log('Crear voz personalizada');
    // Aquí podrías abrir un modal o redirigir al flujo de clonación de voz
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
    if (this.step === 'connectPhone') {
      this.step = 'summary';
    } else if (this.step === 'summary') {
      this.step = 'knowledgeBase';
    } else if (this.step === 'knowledgeBase') {
      this.step = 'actions';
    } else if (this.step === 'actions') {
      this.step = 'instructions';
    } else if (this.step === 'instructions') {
      this.step = 'voices';
    } else if (this.step === 'voices') {
      this.step = 'language';
    } else if (this.step === 'language') {
      this.step = 'callType';
    } else if (this.step === 'callType') {
      this.step = 'agentName';
    } else if (this.step === 'agentName') {
      // Primer paso: volver a la pantalla anterior
      this.location.back();
    }
    // Si ya está en 'final' o 'success', no hace nada
  }

  onSkip() {
    if (this.step === 'agentName') {
      this.step = 'callType';
    } else if (this.step === 'callType') {
      this.step = 'language';
    } else if (this.step === 'language') {
      this.step = 'voices';
    } else if (this.step === 'voices') {
      this.step = 'instructions';
    } else if (this.step === 'instructions') {
      this.step = 'actions';
    } else if (this.step === 'actions') {
      this.step = 'knowledgeBase';
    } else if (this.step === 'knowledgeBase') {
      this.step = 'summary';
    } else if (this.step === 'summary') {
      this.step = 'connectPhone';
    }
    // Si ya está en 'connectPhone', no hace nada o puedes reiniciar el flujo si lo deseas
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
    this.step = 'callType';
    this.saveDraft();
  }

  playVoice(voiceName: string) {
    if (this.isPlaying && this.currentPlayingVoice === voiceName) {
      // Si ya está reproduciendo esta voz, pausar
      this.pauseVoice();
      return;
    }

    console.log('Reproduciendo voz:', voiceName);

    if (this.audioActual) {
      this.audioActual.pause();
      this.audioActual.currentTime = 0;
    }

    const audio = new Audio(`assets/${voiceName}.mp3`);
    this.audioActual = audio;
    this.isPlaying = true;
    this.currentPlayingVoice = voiceName;

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
      console.error('Error al cargar el audio');
      this.isPlaying = false;
      this.currentPlayingVoice = null;
      if (this.audioActual === audio) {
        this.audioActual = null;
      }
      this.modalService.openError({
        title: 'Error de audio',
        message: 'Hubo un problema al cargar el audio',
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
    console.log('Formulario enviado', {
      greeting: this.greeting,
      template: this.template,
      instructions: this.instructions
    });

    this.step = 'actions'; // Avanza a "Añadir Acciones"
    this.saveDraft();
  }

  selectAction(platform: string) {
    console.log('Plataforma seleccionada:', platform);

    if (platform === 'shopify') {
      // Abrir modal de Shopify
      const dialogRef = this.modalService.openShopify({
        title: 'Integración con Shopify',
        message: 'Configura tu conexión con Shopify',
        formEnabled: false
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('Shopify modal closed with result:', result);
        if (result && result.type === 'shopify') {
          console.log('Configuración de Shopify guardada:', result);
          // Solo avanzar si el usuario completó la configuración explícitamente
          this.step = 'knowledgeBase';
        }
        // Si no hay resultado o no es de tipo shopify, permanecer en la misma página
      });
    } else if (platform === 'make') {
      // Abrir modal de Make
      const dialogRef = this.modalService.openMake({
        title: 'Integración con Make',
        message: 'Configura tu conexión con Make',
        formEnabled: false
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('Make modal closed with result:', result);
        // El modal de Make ya no retorna resultado, solo se cierra
        // No avanzar automáticamente
      });
    } else {
      // Para otras plataformas, continuar normalmente
      this.step = 'knowledgeBase';
    }
  }

  // Propiedades para documentos PDF
  uploadedDocuments: File[] = [];
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  // ✅ Nuevos métodos para la pantalla de Base de Conocimientos
  selectKnowledgeSource(source: 'pdf' | 'web') {
    console.log('Fuente seleccionada:', source);

    if (source === 'web') {
      // Abrir modal de Web
      const dialogRef = this.modalService.openWeb({
        title: 'Web',
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('Web modal closed with result:', result);
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
        console.log('Documentos subidos:', this.uploadedDocuments.length);

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
    console.log('Documentos eliminados');
  }

  // Opcional: Método para continuar sin elegir fuente
  continueWithoutSource() {
    this.step = 'summary'; // Pasa a resumen
    this.saveDraft();
  }

  onSubmitTestCall() {
    if (!this.phoneNumber) {
      this.modalService.openError({
        title: 'Número requerido',
        message: 'Por favor, ingrese un número de teléfono',
      });
      return;
    }
    console.log('Número ingresado para prueba:', this.phoneNumber);
    // Avanza a conectar número de teléfono
    this.step = 'connectPhone';
    this.saveDraft();
  }

  // Métodos para conectar número de teléfono
  onConnectPhone() {
    // Aquí puedes validar los datos antes de continuar
    console.log('Datos del número de teléfono:', {
      phone: this.phoneNumber,
      //  sid: this.sid,
      //  token: this.token,
      // label: this.label,
      // importedNumber: this.importedNumber
    });
    // Navega a pantalla final
    this.step = 'final';

    // Simulamos 5 segundos de carga
    setTimeout(() => {
      this.step = 'success'; // Cambia a pantalla de éxito
      // Limpiar el borrador cuando el agente se crea con éxito
      this.clearSavedDraft();
    }, 5000);
  }

  openTwilioStepsModal() {
    this.modalService.openTwilioSteps();
  }

  onSkipConnectPhone() {
    // Salta a pantalla final
    this.step = 'final';

    // Simulamos 5 segundos de carga antes de mostrar éxito
    setTimeout(() => {
      this.step = 'success';
      // Limpiar el borrador cuando el agente se crea con éxito
      this.clearSavedDraft();
    }, 5000);
  }

  // Declare showCountryMenu property
  showCountryMenu = false;
  selectedCountryCode = '+34';
  selectedCountry = 'es';

  toggleCountryMenu() {
    this.showCountryMenu = !this.showCountryMenu;
  }

  selectCountry(countryCode: string, code: string, flagColor1: string, flagColor2: string) {
    this.selectedCountryCode = code;
    this.selectedCountry = countryCode;
    this.showCountryMenu = false;
    this.updateFlag(countryCode);
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

    const dropdown = target.closest('.w-32.h-14');
    const menu = target.closest('ul');
    const menuItem = target.closest('li');

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
    console.log('Tiempo de inactividad actualizado:', this.getFormattedInactivityTimeout());
  }

  // Método para actualizar la duración máxima
  updateMaxCallDuration(value: number) {
    this.maxCallDuration = value;
    console.log('Duración máxima actualizada:', this.getFormattedMaxCallDuration());
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
      console.log('Configuración avanzada guardada:', {
        inactivityTimeout: this.inactivityTimeout,
        maxCallDuration: this.maxCallDuration,
        agentSpeed: this.agentSpeed,
        llmTemperature: this.llmTemperature,
        isRecordingNoticeEnabled: this.isRecordingNoticeEnabled,
        recordingNoticeText: this.isRecordingNoticeEnabled ? this.recordingNoticeText : null
      });

      // Cambia a prueba de agente
      this.step = 'summary';
      this.animateIdle();
      this.saveDraft();
    }
  }

  // Método para saltar la configuración avanzada
  onSkipAdvancedSettings() {
    console.log('Configuración avanzada saltada');
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
    console.log('Configuración avanzada reseteada a valores por defecto');
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
    console.log('Inactivity: ', this.inactivityTimeout);
  }

  onMaxCallDurationChange() {
    console.log('Max duration: ', this.maxCallDuration);
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
    console.log('Generando prompt con descripción:', this.promptDescription);
    // TODO: Implementar la llamada a la API de IA
    this.closeGeneratePromptModal();
  }

}