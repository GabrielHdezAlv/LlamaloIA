import { Component, inject } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
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
export class AgentsComponent {
  dialog = inject(MatDialog);
  private twilioService = inject(TwilioService);
  private agentsService = inject(AgentsService);
  private userService = inject(UserService);

  public twilioStorage = inject(TwilioStorage);
  private userStorage = inject(UserStorage);

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

  ngOnInit() {
    this.userService.getLanguages().subscribe((languages) => {
      this.languages = languages;
    });

    this.agentsService.getAgents().subscribe((agents) => {
      this.agents = agents;
    });

    this.selectedAgent = this.userStorage.user()?.agent ?? this.agents[0];
    this.selectedLanguage = this.selectedAgent?.language ?? this.languages[0];
  }

  selectLanguage(lang: any) {
    this.selectedLanguage = lang;
    this.showDropdown = false;
  }

  selectAgent(agent: Agent) {
    this.selectedAgent = agent;
    this.showVoiceDropdown = false;
  }

  openIntegrationDialog(editMode: boolean) {
    const existingConfig = this.twilioStorage.config();

    const dialogRef = this.dialog.open(TwilioIntegrationModalComponent, {
      width: '380px',
      disableClose: true,
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
        disableClose: true,
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
      disableClose: true,
      panelClass: 'loader-dialog',
    });

    this.selectedAgent.language = this.selectedLanguage;

    this.agentsService.setAgentConfig(this.selectedAgent).subscribe({
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
      },
    });
  }
}
