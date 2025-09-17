import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common'; // 👈 Importa Location
import { ModalService } from '../../shared/modals/modal.service';

@Component({
  selector: 'app-new-create-agents',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './new-create-agents.component.html',
  styleUrl: './new-create-agents.component.scss'
})
export class NewCreateAgentsComponent {
  step: 'callType' | 'language' | 'voices' | 'instructions' | 'actions' | 'knowledgeBase' | 'summary' | 'connectPhone' | 'advancedSettings' | 'final' | 'success' = 'callType';

  // Add this line to declare phoneNumber
  phoneNumber = '';

  constructor(private location: Location, private modalService: ModalService) {} // ✅ Añade esto

  greeting = 'Hola, gracias por llamar a [Nombre del Negocio]. ¿En qué puedo ayudarte?';
  template = '';
  instructions = '';

  audioActual: HTMLAudioElement | null = null;
  isPlaying: boolean = false;
  currentPlayingVoice: string | null = null;

  onSelect(type: 'inbound' | 'outbound') {
    this.step = 'language';
  }

  onLanguageSelected() {
    this.step = 'voices';
  }

  onVoiceSelected() {
    this.step = 'instructions';
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
    }
    // Si ya está en 'final' o 'success', no hace nada
  }

  onSkip() {
    if (this.step === 'callType') {
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
        message: 'No se pudo reproducir el audio seleccionado.',
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
        message: 'Hubo un problema al cargar el audio.',
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
    this.step = 'knowledgeBase'; // Avanza a "Base de Conocimientos"
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
  // Vuelve a la página anterior (por ejemplo, /dashboard/agents)
  this.location.back();
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
}