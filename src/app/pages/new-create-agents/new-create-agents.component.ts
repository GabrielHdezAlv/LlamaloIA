import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 👈 Importa FormsModule

@Component({
  selector: 'app-new-create-agents',
  standalone: true,
  imports: [FormsModule], // Asegúrate de incluir `FormsModule` si usas `ngModel`
  templateUrl: './new-create-agents.component.html',
  styleUrl: './new-create-agents.component.scss'
})
export class NewCreateAgentsComponent {
  step: 'callType' | 'language' | 'voices' | 'instructions' = 'callType';

  // Variables del formulario
  greeting = 'Hola, gracias por llamar a [Nombre del Negocio]. ¿En qué puedo ayudarte?';
  template = '';
  instructions = '';

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
    if (this.step === 'instructions') {
      this.step = 'voices';
    } else if (this.step === 'voices') {
      this.step = 'language';
    } else if (this.step === 'language') {
      this.step = 'callType';
    }
  }

  audioActual: HTMLAudioElement | null = null;

  playVoice(voiceName: string) {
    console.log('Reproduciendo voz:', voiceName);

    // Si hay un audio reproduciéndose, lo pausamos y lo reiniciamos
    if (this.audioActual) {
      this.audioActual.pause();
      this.audioActual.currentTime = 0;
      this.audioActual = null;
    }

    const audio = new Audio(`assets/${voiceName}.mp3`);
    this.audioActual = audio;

    setTimeout(() => {
      audio.play();
      // Cuando termine, limpiamos la referencia
      audio.onended = () => {
        if (this.audioActual === audio) {
          this.audioActual = null;
        }
      };
    }, 1000); // Espera 1 segundo antes de reproducir
  }

  onSubmit() {
    console.log('Formulario enviado', {
      greeting: this.greeting,
      template: this.template,
      instructions: this.instructions
    });

    // Aquí puedes:
    // - Enviar los datos a un servicio
    // - Crear el agente
    // - Navegar a la siguiente pantalla
    // Por ahora, solo avanzamos (ejemplo)
    // this.step = 'summary'; // si tuvieras una pantalla final
  }
}