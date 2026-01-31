import { Component, inject, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TwilioIntegrationModalComponent } from '../../shared/modals/twilio-integration-modal/twilio-integration-modal.component';
import { TwilioSuccessModalComponent } from '../../shared/modals/twilio-success-modal/twilio-success-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { TwilioConfig, TwilioConfigRequest, TwilioConfigLocal } from '../../shared/models/twilio-config.model';
import { TwilioService } from '../../core/services/twilio.service';
import { TwilioStorage } from '../../storages/twilio/twilio-storage';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { AgentsService } from '../../core/services/agents.service';
import { Voice } from '../../shared/models/voice.model';
import { SetAgentConfigDto } from '../../shared/models/agent.model';
import { UserStorage } from '../../storages/user/user-storage';
import { UserService } from '../../core/services/user.service';
import { ModalService } from '../../shared/modals/modal.service';

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './agents.component.html',
  styleUrl: './agents.component.scss',
})
export class AgentsComponent implements OnInit {
  // Variable para controlar la animación de fade in
  showContent: boolean = false;

  private isBrowser: boolean;

  dialog = inject(MatDialog);
  private twilioService = inject(TwilioService);
  private agentsService = inject(AgentsService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);

  public twilioStorage: any = inject(TwilioStorage);
  private userStorage: any = inject(UserStorage);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  showIntegrationModal = false;
  showSuccessModal = false;

  textareaFocused = false;

  languages = [
    { code: 'es', name: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
    { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
  ];

  showDropdown = false;

  voices: Voice[] = [];

  selectedVoice: Voice | null = null;
  selectedLanguage: any = null;
  showVoiceDropdown = false;

  currentStep = 1; // Seteado el valor por defecto en la primera pantalla
  public firstInteractionMessage: string = '';

  ngOnInit() {
    let token: string | null = null;

    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('token');
    }
    if (!token) {
      window.location.href = '/login'; // O usa '/' si tu página de inicio es esa
      return;
    }

    this.userService.getLanguages().subscribe((languages) => {
      this.languages = languages;
    });

    this.agentsService.getVoices().subscribe((voices) => {
      this.voices = voices;

      // Recuperar la voz seleccionada del localStorage
      let savedVoiceId: string | null = null;

      if (typeof window !== 'undefined' && window.localStorage) {
        savedVoiceId = localStorage.getItem('selectedVoiceId');
      }

      if (savedVoiceId && voices.length > 0) {
        this.selectedVoice =
          voices.find((voice) => voice.voiceId === savedVoiceId) || voices[0];
      } else {
        // Si hay una voz guardada en el usuario, intentar encontrarla
        const userVoiceId = this.userStorage.user()?.voiceId;
        if (userVoiceId && voices.length > 0) {
          this.selectedVoice = voices.find((voice) => voice.voiceId === userVoiceId) || voices[0];
        } else {
          this.selectedVoice = voices[0] || null;
        }
      }

      // Obtener el idioma guardado o usar el primero por defecto
      const savedLanguage = this.userStorage.user()?.language;
      this.selectedLanguage = savedLanguage || this.languages[0];
    });

    // Inicializar el mensaje de saludo personalizado
    const config = this.twilioStorage.config();
    this.firstInteractionMessage = config?.firstInteraction || '';

    // Listar agentes del usuario
    this.agentsService.getAgentsList().subscribe({
      next: (response) => {
      },
      error: (error) => {
        console.error('❌ Error al obtener agentes:', error);
      },
    });

    // Ejecutar animación siempre
    this.startFadeInAnimation();
  }

  selectLanguage(lang: any) {
    this.selectedLanguage = lang;
    this.showDropdown = false;
  }

  selectVoice(voice: Voice) {
    this.selectedVoice = voice;
    this.showVoiceDropdown = false;

    // Guardar la voz seleccionada en localStorage
    if (
      voice &&
      voice.voiceId &&
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      localStorage.setItem('selectedVoiceId', voice.voiceId);
    }
  }

  openIntegrationDialog(editMode: boolean) {
    const existingConfig = this.twilioStorage.config();

    const dialogRef = this.dialog.open(TwilioIntegrationModalComponent, {
      width: '380px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data: {
        formEnabled: editMode,
        config: existingConfig,
        twilioAccountId: existingConfig?.twilioAccountId,  // ⚠️ NUEVO: pasar twilioAccountId si existe
        // Valores adicionales para el storage local (TwilioConfigLocal)
        firstInteraction: this.firstInteractionMessage || existingConfig?.firstInteraction || '',
        firstInteractionUrl: existingConfig?.firstInteractionUrl || '',
        agentInstruction: existingConfig?.agentInstruction || '',
      },
    });

    dialogRef.afterClosed().subscribe((result: TwilioConfigLocal) => {
      if (!result) return;

      const loaderRef = this.dialog.open(LoaderComponent, {
        width: '100px',
        disableClose: false,
        panelClass: 'loader-dialog',
      });

      // Crear TwilioConfigRequest con twilioSid, twilioToken y twilioAccountId si existe
      const configRequest: TwilioConfigRequest = {
        twilioSid: result.twilioSid || '',
        twilioToken: result.twilioToken || '',
        twilioAccountId: result.twilioAccountId,
      };

      this.twilioService.setConfig(configRequest).subscribe({
        next: () => {
          loaderRef.close();
          this.openSuccessDialog(result);
        },
        error: (err) => {
          loaderRef.close();
          console.error('Error al guardar la configuración:', err);
          this.modalService.openError({
            title: 'Error de configuración',
            message: 'No se pudo guardar la configuración de Twilio.',
            details: String(err)
          });
        },
      });
    });
  }

  openSuccessDialog(twilioData: TwilioConfigLocal) {
    this.dialog.open(TwilioSuccessModalComponent, {
      width: '400px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data: {
        message: twilioData.countryCode + ' ' + twilioData.phoneNumber,
        title: 'Integración Twilio',
        twilioData: twilioData,
      },
    });
  }

  closeModals() {
    this.showIntegrationModal = false;
    this.showSuccessModal = false;
  }

  publishAgent() {
    if (!this.selectedVoice) {
      return;
    }

    const loaderRef = this.dialog.open(LoaderComponent, {
      width: '100px',
      disableClose: false,
      panelClass: 'loader-dialog',
    });

    // Validar que el mensaje no esté vacío
    if (
      !this.firstInteractionMessage ||
      this.firstInteractionMessage.trim() === ''
    ) {
      loaderRef.close();
      console.error('El mensaje de saludo personalizado no puede estar vacío.');
      this.modalService.openError({
        title: 'Validación',
        message: 'El mensaje de saludo personalizado no puede estar vacío.',
      });
      return;
    }

    // Obtener configuración de Twilio
    const twilioConfig = this.twilioStorage.config();
    
    // Validar que tenemos los datos necesarios
    if (!twilioConfig?.countryCode || !twilioConfig?.phoneNumber) {
      loaderRef.close();
      this.modalService.openError({
        title: 'Validación',
        message: 'Por favor, configura primero la integración con Twilio (número de teléfono).',
      });
      return;
    }

    // Construir el DTO para crear el agente
    const languageCode = typeof this.selectedLanguage === 'string' 
      ? this.selectedLanguage 
      : this.selectedLanguage?.code || 'es';

    const agentConfig: SetAgentConfigDto = {
      name: this.selectedVoice.name || 'Agente',
      language: languageCode,
      type: 'inbound', // Por defecto inbound, puede ser configurable en el futuro
      voiceId: this.selectedVoice.voiceId,
      firstInteraction: this.firstInteractionMessage,
      agentInstruction: twilioConfig.agentInstruction || '',
      phoneNumbers: {
        countryCode: twilioConfig.countryCode,
        number: twilioConfig.phoneNumber,
      },
      label: `${this.selectedVoice.name} - ${this.selectedLanguage?.name || languageCode}`,
      parameters: {
        stability: 0.72,
        similarity: 0.8,
        style: 0.5,
        boost: true,
        speed: 0.98
      },
      state: "Activo"
    };

    // Crear el agente
    this.agentsService.createAgent(agentConfig).subscribe({
      next: (response) => {
        loaderRef.close();
        this.dialog.open(TwilioSuccessModalComponent, {
          width: '400px',
          disableClose: false,
          panelClass: 'custom-dialog-container',
          data: {
            message: '¡Agente creado exitosamente!',
            title: 'Configuración Completada',
          },
        });
      },
      error: (error) => {
        loaderRef.close();
        console.error('Error al crear el agente:', error);
        this.modalService.openError({
          title: 'Error',
          message: 'No se pudo crear el agente.',
          details: String(error)
        });
      },
    });
  }

  irAlPaso(paso: number) {
    this.currentStep = paso;
    // Si el paso es el de saludo personalizado
    if (paso === 2) {
      const config = this.twilioStorage.config();
      this.firstInteractionMessage = config?.firstInteraction || '';
    }
    // Aquí puedes agregar lógica adicional según el paso
  }

  getProgressWidth(): string {
    const totalSteps = 4; // Total de pasos (1, 2, 3, 4)
    const progress = (this.currentStep / totalSteps) * 100;
    return `${progress}%`;
  }

  private startFadeInAnimation(): void {
    // Verificar si estamos en el navegador de manera más robusta
    const isInBrowser = typeof window !== 'undefined' && window.localStorage;
    
    if (!isInBrowser) {
      this.showContent = true;
      return;
    }
    
    // Contenido aparece después de 100ms
    setTimeout(() => {
      this.showContent = true;
    }, 100);
  }
}
