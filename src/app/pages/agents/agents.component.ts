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
  public twilioStorage = inject(TwilioStorage);

  showIntegrationModal = false;
  showSuccessModal = false;

  textareaFocused = false;

  languages = [
    { code: 'es', name: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
    { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
  ];

  selectedLanguage = this.languages[0];
  showDropdown = false;

  voices = [
    { name: 'Carlos', value: 'carlos', img: 'assets/agent_carlos.png' },
    { name: 'Carlos 2', value: 'carlos2', img: 'assets/agent_carlos.png' },
    { name: 'Carlos 3', value: 'carlos3', img: 'assets/agent_carlos.png' },
  ];

  selectedVoice = this.voices[0];
  showVoiceDropdown = false;

  selectLanguage(lang: any) {
    this.selectedLanguage = lang;
    this.showDropdown = false;
  }

  selectVoice(voice: any) {
    this.selectedVoice = voice;
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
      data: twilioData,
    });
  }

  closeModals() {
    this.showIntegrationModal = false;
    this.showSuccessModal = false;
  }
}
