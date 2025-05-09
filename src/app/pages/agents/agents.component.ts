import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TwilioIntegrationModalComponent } from '../../shared/modals/twilio-integration-modal/twilio-integration-modal.component';
import { TwilioSuccessModalComponent } from '../../shared/modals/twilio-success-modal/twilio-success-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-agents',
  imports: [
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './agents.component.html',
  styleUrl: './agents.component.scss',
})
export class AgentsComponent {
  constructor(private dialog: MatDialog) {}

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

  openIntegrationDialog() {
    this.dialog.open(TwilioIntegrationModalComponent, {
      width: '380px',
      disableClose: true,
      panelClass: 'custom-dialog-container',
    });
  }

  openSuccessDialog() {
    this.dialog.open(TwilioSuccessModalComponent, {
      width: '300px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
    });
  }

  closeModals() {
    this.showIntegrationModal = false;
    this.showSuccessModal = false;
  }
}
