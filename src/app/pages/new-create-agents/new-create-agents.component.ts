import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-create-agents',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './new-create-agents.component.html',
  styleUrl: './new-create-agents.component.scss'
})
export class NewCreateAgentsComponent {
  step: 'callType' | 'language' | 'voices' | 'instructions' | 'actions' | 'knowledgeBase' | 'summary' = 'callType';

  greeting = 'Hola, gracias por llamar a [Nombre del Negocio]. ¿En qué puedo ayudarte?';
  template = '';
  instructions = '';

  audioActual: HTMLAudioElement | null = null;
  isPlaying: boolean = false;

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
    if (this.step === 'knowledgeBase') {
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
  }

  onSkip() {
    this.step = 'knowledgeBase'; // O puedes saltar directamente a la última etapa
  }

  playVoice(voiceName: string) {
    if (this.isPlaying) return;

    console.log('Reproduciendo voz:', voiceName);

    if (this.audioActual) {
      this.audioActual.pause();
      this.audioActual.currentTime = 0;
    }

    const audio = new Audio(`assets/${voiceName}.mp3`);
    this.audioActual = audio;
    this.isPlaying = true;

    audio.play().catch(err => {
      console.error('Error al reproducir audio:', err);
      this.isPlaying = false;
    });

    audio.onended = () => {
      this.isPlaying = false;
      if (this.audioActual === audio) {
        this.audioActual = null;
      }
    };

    audio.onerror = () => {
      console.error('Error al cargar el audio');
      this.isPlaying = false;
      if (this.audioActual === audio) {
        this.audioActual = null;
      }
    };
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
  }

  // ✅ Nuevos métodos para la pantalla de Base de Conocimientos
  selectKnowledgeSource(source: 'pdf' | 'web') {
    console.log('Fuente seleccionada:', source);
    // Aquí puedes guardar la selección o abrir un modal de carga
  }

  // Opcional: Método para continuar sin elegir fuente
  continueWithoutSource() {
    this.step = 'summary'; // Pasa a la pantalla final
  }
}