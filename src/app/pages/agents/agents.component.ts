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
import { TwilioConfig } from '../../shared/models/twilio-config.model';
import { TwilioService } from '../../core/services/twilio.service';
import { TwilioStorage } from '../../storages/twilio/twilio-storage';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { AgentsService } from '../../core/services/agents.service';
import { Agent } from '../../shared/models/agent.model';
import { UserStorage } from '../../storages/user/user-storage';
import { UserService } from '../../core/services/user.service';
import { ElevenLabsService } from '../../core/services/eleven-labs.service';
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
  private elevenLabsService = inject(ElevenLabsService);
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

  agents: Agent[] = [];

  selectedAgent: Agent | null = null;
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

    this.agentsService.getAgents().subscribe((agents) => {
      this.agents = agents;

      // Recuperar el agente seleccionado del localStorage
      let savedAgentId: string | null = null;

      if (typeof window !== 'undefined' && window.localStorage) {
        savedAgentId = localStorage.getItem('selectedAgentId');
      }

      if (savedAgentId && agents.length > 0) {
        this.selectedAgent =
          agents.find((agent) => agent.labsId === savedAgentId) || agents[0];
      } else {
        this.selectedAgent = this.userStorage.user()?.agent ?? agents[0];
      }

      this.selectedLanguage = this.selectedAgent?.language ?? this.languages[0];
    });

    // Inicializar el mensaje de saludo personalizado
    const config = this.twilioStorage.config();
    this.firstInteractionMessage = config?.firstInteraction || '';

    // Ejecutar animación siempre
    this.startFadeInAnimation();
  }

  selectLanguage(lang: any) {
    this.selectedLanguage = lang;
    this.showDropdown = false;
  }

  selectAgent(agent: Agent) {
    this.selectedAgent = agent;
    this.showVoiceDropdown = false;

    // Guardar el agente seleccionado en localStorage
    if (
      agent &&
      agent.labsId &&
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      localStorage.setItem('selectedAgentId', agent.labsId);
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
      },
    });

    dialogRef.afterClosed().subscribe((result: TwilioConfig) => {
      if (!result) return;

      const loaderRef = this.dialog.open(LoaderComponent, {
        width: '100px',
        disableClose: false,
        panelClass: 'loader-dialog',
      });

      this.twilioService.setConfig(result).subscribe({
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

  openSuccessDialog(twilioData: TwilioConfig) {
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
    console.log('publishAgent: ', this.selectedAgent);

    if (!this.selectedAgent) {
      return;
    }

    const loaderRef = this.dialog.open(LoaderComponent, {
      width: '100px',
      disableClose: false,
      panelClass: 'loader-dialog',
    });

    this.selectedAgent.language = this.selectedLanguage;

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

    // Primero guardar el mensaje de firstInteraction
    this.elevenLabsService
      .setFirstInteraction(this.firstInteractionMessage)
      .subscribe({
        next: () => {
          // Actualizar el store local con el nuevo firstInteraction
          const config = this.twilioStorage.config();
          if (config) {
            config.firstInteraction = this.firstInteractionMessage;
            this.twilioStorage.setConfig(config);
          }
          // Luego guardar la configuración del agente
          this.agentsService.setAgentConfig(this.selectedAgent!).subscribe({
            next: (response) => {
              loaderRef.close();
              this.dialog.open(TwilioSuccessModalComponent, {
                width: '400px',
                disableClose: false,
                panelClass: 'custom-dialog-container',
                data: {
                  message: '¡Agente configurado exitosamente!',
                  title: 'Configuración Completada',
                },
              });
            },
            error: (error) => {
              loaderRef.close();
              console.error('Error al publicar el agente:', error);
              this.modalService.openError({
                title: 'Error',
                message: 'No se pudo publicar el agente.',
                details: String(error)
              });
            },
          });
        },
        error: (error) => {
          loaderRef.close();
          console.error(
            'Error al guardar el mensaje de firstInteraction:',
            error
          );
          this.modalService.openError({
            title: 'Error',
            message: 'No se pudo guardar el mensaje inicial.',
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
    console.log('AgentsComponent startFadeInAnimation - isBrowser:', this.isBrowser);
    
    // Verificar si estamos en el navegador de manera más robusta
    const isInBrowser = typeof window !== 'undefined' && window.localStorage;
    console.log('Verificación robusta del navegador:', isInBrowser);
    
    if (!isInBrowser) {
      console.log('No es navegador, mostrando contenido inmediatamente');
      this.showContent = true;
      return;
    }

    console.log('Ejecutando animación con delay...');
    
    // Contenido aparece después de 100ms
    setTimeout(() => {
      console.log('Mostrando contenido de agentes');
      this.showContent = true;
    }, 100);
  }
}
