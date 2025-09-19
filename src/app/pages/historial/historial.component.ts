import { Component, inject } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

export interface Contact {
  id: number;
  phone: string;
  time: string;
  avatar: string;
  status: 'resuelto' | 'pendiente';
  lastInteraction: string;
  messages: Message[];
  audioSrc?: string;
}

export interface Message {
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

@Component({
  selector: 'app-historial',
  standalone: true,
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss']
})
export class HistorialComponent {
  private i18nService = inject(I18nService);

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }
  contacts: Contact[] = [
    {
      id: 1,
      phone: '+34 600 11 22 33',
      time: '2m 14s',
      avatar: 'assets/predeterminada.webp',
      status: 'resuelto',
      lastInteraction: '15 Sep 2025 - 13:59',
      audioSrc: 'https://example.com/audio1.mp3', // Simulado
      messages: [
        {
          sender: 'user',
          text: 'When do you release the code for the Fleet - Travel kit?\nhttps://ui8.net/product-link',
          timestamp: '13:59'
        },
        {
          sender: 'agent',
          text: 'Hi @orval, thanks for contacting.\nYes, I\'m working on it. It would be released next 2 weeks. You could check the progress here:\nhttps://ui8.net/progress',
          timestamp: '14:02'
        }
      ]
    },
    {
      id: 2,
      phone: '+34 600 44 55 66',
      time: '4m 18s',
      avatar: 'assets/predeterminada.webp',
      status: 'resuelto',
      lastInteraction: '14 Sep 2025 - 10:23',
      audioSrc: 'https://example.com/audio2.mp3',
      messages: [
        {
          sender: 'user',
          text: 'Hola, no recibí mi pedido. ¿Pueden ayudarme?',
          timestamp: '10:23'
        },
        {
          sender: 'agent',
          text: 'Claro, vamos a revisarlo. ¿Podrías darme tu número de pedido?',
          timestamp: '10:25'
        }
      ]
    },
    {
      id: 3,
      phone: '+34 600 77 88 99',
      time: '1m 14s',
      avatar: 'assets/predeterminada.webp',
      status: 'pendiente',
      lastInteraction: '13 Sep 2025 - 16:45',
      audioSrc: 'https://example.com/audio3.mp3',
      messages: [
        {
          sender: 'user',
          text: 'El producto llegó roto. Necesito un reembolso.',
          timestamp: '16:45'
        },
        {
          sender: 'agent',
          text: 'Lamentamos mucho eso. Ya estamos procesando tu reembolso. Te llegará en 3-5 días hábiles.',
          timestamp: '16:48'
        }
      ]
    }
  ];

  selectedContact: Contact | null = this.contacts[0]; // Por defecto el primero
  currentAudioTime = '0:00';
  audioDuration = '1:23';
  isPlaying = false;

  selectContact(contact: Contact) {
    this.selectedContact = contact;
    // Aquí puedes simular carga de audio o duración real
    this.currentAudioTime = '0:00';
    this.audioDuration = contact.id === 1 ? '1:23' : contact.id === 2 ? '2:10' : '0:45';
    this.isPlaying = false;
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    // Aquí iría la lógica real de audio, pero por ahora solo visual
  }

  formatStatus(status: 'resuelto' | 'pendiente') {
    return status === 'resuelto' ? this.t.resolved : this.t.pending;
  }

  constructor() {
    this.i18nService.initializeLanguage();
  }
}