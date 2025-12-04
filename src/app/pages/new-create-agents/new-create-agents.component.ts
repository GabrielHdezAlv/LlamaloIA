import { Component, HostListener, OnDestroy, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common'; // 👈 Importa Location
import { ModalService } from '../../shared/modals/modal.service';
import { I18nService } from '../../core/services/i18n.service';
import lottie from 'lottie-web';

@Component({
  selector: 'app-new-create-agents',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './new-create-agents.component.html',
  styleUrl: './new-create-agents.component.scss'
})
export class NewCreateAgentsComponent implements OnDestroy, AfterViewChecked {
  @ViewChild('lottieContainer', { static: false }) lottieContainer!: ElementRef<HTMLDivElement>;
  
  step: 'agentName' | 'callType' | 'language' | 'voices' | 'instructions' | 'actions' | 'knowledgeBase' | 'summary' | 'connectPhone' | 'advancedSettings' | 'final' | 'success' = 'agentName';

  // Add this line to declare phoneNumber
  phoneNumber = '';
  
  private lottieInstance: any = null;
  private lottieInitialized = false;

  constructor(private location: Location, private modalService: ModalService, private i18nService: I18nService) {} // ✅ Añade esto

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  greeting = 'Hola, gracias por llamar a [Nombre del Negocio]. ¿En qué puedo ayudarte?';
  template = '';
  instructions = '';
  agentName: string = '';

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
    { id: 'custom', name: 'Clonar voz', image: '', isCustom: true },
    { id: 'carla', name: 'Carla', image: 'assets/carla_prueba.png' },
    { id: 'carlos', name: 'Carlos', image: 'assets/carlos_prueba.png' },
    { id: 'david', name: 'David', image: 'assets/david_prueba.png' },
    { id: 'jesus', name: 'Jesús', image: 'assets/jesus_prueba.png' },
    { id: 'claudia', name: 'Claudia', image: 'assets/claudia_prueba.png' },
    { id: 'maria', name: 'María', image: 'assets/maria_prueba.png' }
  ];
  

  onSelect(type: 'inbound' | 'outbound') {
    this.step = 'language';
  }

  onLanguageSelected() {
    this.step = 'voices';
  }

  onVoiceSelected() {
    this.step = 'instructions';
  }

  createCustomVoice() {
    console.log('Crear voz personalizada');
    // Aquí podrías abrir un modal o redirigir al flujo de clonación de voz
  }

  // Métodos para el carrusel de voces
  nextVoice() {
    const visibleCount = this.getVisibleCount();
    const maxIndex = Math.max(this.voices.length - visibleCount, 0);

    if (this.currentVoiceIndex < maxIndex) {
      // En tablets avanzar de 2 en 2, en desktop de 1 en 1
      const step = visibleCount === 2 ? 2 : 1;
      this.currentVoiceIndex = Math.min(this.currentVoiceIndex + step, maxIndex);
    }
  }

  previousVoice() {
    const visibleCount = this.getVisibleCount();

    if (this.currentVoiceIndex > 0) {
      // En tablets retroceder de 2 en 2, en desktop de 1 en 1
      const step = visibleCount === 2 ? 2 : 1;
      this.currentVoiceIndex = Math.max(this.currentVoiceIndex - step, 0);
    }
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
    return this.currentVoiceIndex >= this.voices.length - visibleCount;
  }

  shouldHideCarousel(): boolean {
    return this.voices.length <= this.getVisibleCount();
  }

  getMaxIndicatorIndex(): number {
    const visibleCount = this.getVisibleCount();
    return Math.max(this.voices.length - visibleCount, 0);
  }

  getCarouselTransform(): string {
    const visibleCount = this.getVisibleCount();
    const gap = this.getSlideGapPx();
    const offsetPercent = (100 / visibleCount) * this.currentVoiceIndex;
    if (gap === 0) {
      return `translateX(-${offsetPercent}%)`;
    }
    const offsetGap = gap * this.currentVoiceIndex;
    return `translateX(calc(-${offsetPercent}% - ${offsetGap}px))`;
  }

  getSlideWidthPercent(): string {
    const visibleCount = this.getVisibleCount();
    const gap = this.getSlideGapPx();
    if (gap === 0) {
      return `${100 / visibleCount}%`;
    }
    const totalGap = gap * (visibleCount - 1);
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
    if (width >= 1536) return 4;
    if (width >= 1280) return 3;
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
    const totalPages = Math.max(Math.ceil(this.voices.length / this.getVisibleCount()), 1);
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  getCurrentPage(): number {
    return Math.floor(this.currentVoiceIndex / this.getVisibleCount());
  }

  goToPage(pageIndex: number) {
    const visibleCount = this.getVisibleCount();
    const maxIndex = Math.max(this.voices.length - visibleCount, 0);
    this.currentVoiceIndex = Math.min(pageIndex * visibleCount, maxIndex);
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
    if (this.step === 'advancedSettings') {
      this.step = 'connectPhone';
    } else if (this.step === 'connectPhone') {
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
    } else if (this.step === 'connectPhone') {
      this.step = 'advancedSettings';
    }
    // Si ya está en 'advancedSettings', no hace nada o puedes reiniciar el flujo si lo deseas
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

  // ✅ Nuevos métodos para la pantalla de Base de Conocimientos
  selectKnowledgeSource(source: 'pdf' | 'web') {
    console.log('Fuente seleccionada:', source);
    // Avanza automáticamente a la siguiente pantalla
    this.step = 'summary';
  }

  // Opcional: Método para continuar sin elegir fuente
  continueWithoutSource() {
    this.step = 'summary'; // Pasa a la pantalla final
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
    // No se envía al backend
    // Simplemente pasa a la siguiente pantalla (opcional)
    // this.step = 'finalizado';
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
  // Navega a configuración avanzada
  this.step = 'advancedSettings';
 }

 onSkipConnectPhone() {
  // Salta a configuración avanzada
  this.step = 'advancedSettings';
 }

 // Declare showCountryMenu property
 showCountryMenu = false;

 // Nuevas propiedades
 inactivityTimeout = 0;           // Tiempo de inactividad en segundos
 maxCallDuration = 0;            // Duración máxima en segundos
 isRecordingNoticeEnabled = false;
 recordingNoticeText = 'Le informamos que esta llamada será grabada con fines de calidad y seguridad. Puede consultar más información sobre el tratamiento de sus datos en nuestra política de privacidad.';

 // Método para cambiar el estado del aviso de grabación
 toggleRecordingNotice() {
  this.isRecordingNoticeEnabled = !this.isRecordingNoticeEnabled;
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
      isRecordingNoticeEnabled: this.isRecordingNoticeEnabled,
      recordingNoticeText: this.isRecordingNoticeEnabled ? this.recordingNoticeText : null
    });

    // Cambia a pantalla de carga
    this.step = 'final';

    // Simulamos 5 segundos de carga
    setTimeout(() => {
      this.step = 'success'; // Cambia a pantalla de éxito
    }, 5000);
  }
 }

 // Método para saltar la configuración avanzada
 onSkipAdvancedSettings() {
  console.log('Configuración avanzada saltada');
  this.step = 'final';

  // Simulamos 5 segundos de carga antes de mostrar éxito
  setTimeout(() => {
    this.step = 'success';
  }, 5000);
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
    
    // Configurar el analizador para sensibilidad equilibrada
    this.analyser.fftSize = 256; // Resolución equilibrada
    this.analyser.smoothingTimeConstant = 0.3; // Suavizado moderado
    this.analyser.minDecibels = -70;
    this.analyser.maxDecibels = -20;
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
    
    // Aplicar una curva más natural y responsiva
    normalizedLevel = Math.pow(normalizedLevel, 0.5); // Curva más responsiva
    
    // LIMITAR EL NIVEL MÁXIMO A 1.0
    normalizedLevel = Math.min(normalizedLevel, 1.0);
    
    // Transición más equilibrada
    const targetLevel = normalizedLevel * 1.0; // Reducir sensibilidad aún más
    this.audioLevel = this.audioLevel * 0.8 + targetLevel * 0.2; // Mucho más suavizado
    
    // LIMITAR EL AUDIOLEVEL FINAL A 3.0
    this.audioLevel = Math.min(this.audioLevel, 3.0);
    
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
  const baseSize = 200; // Aumentado de 120 a 200
  const maxSize = 280; // Aumentado de 180 a 280
  return Math.min(baseSize + (this.audioLevel * 30), maxSize);
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

}