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
  step: 'callType' | 'language' | 'voices' | 'instructions' | 'actions' | 'knowledgeBase' | 'summary' | 'connectPhone' = 'callType';

  // Add this line to declare phoneNumber
  phoneNumber = '';

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
    }
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
    }
    // Si ya está en 'connectPhone', no hace nada o puedes reiniciar el flujo si lo deseas
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

  onSubmitTestCall() {
    if (!this.phoneNumber) {
      alert('Por favor, ingrese un número de teléfono');
      return;
    }
    console.log('Número ingresado para prueba:', this.phoneNumber);
    // No se envía al backend
    // Simplemente pasa a la siguiente pantalla (opcional)
    // this.step = 'finalizado';
  }

  // Métodoodos para conectar número de teléfono
onConnectPhone() {
  // Aquí puedes validar los datos antes de continuar
  console.log('Datos del número de teléfono:', {
    phone: this.phoneNumber,
  //  sid: this.sid,
  //  token: this.token,
   // label: this.label,
   // importedNumber: this.importedNumber
  });
  // Puedes pasar a otra pantalla final o guardar los datos
 // this.step = 'finalizado'; // O cualquier nombre quieras darle
}

onSkipConnectPhone() {
 // this.step = 'finalizado'; // O puedes saltar directamente a la últimaima etapa
}

  
}