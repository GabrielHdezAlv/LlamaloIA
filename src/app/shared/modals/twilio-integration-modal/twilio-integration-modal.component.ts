import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-twilio-integration-modal',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
    CommonModule
  ],
  templateUrl: './twilio-integration-modal.component.html',
  styleUrl: './twilio-integration-modal.component.scss',
})
export class TwilioIntegrationModalComponent {
  constructor(
    public dialogRef: MatDialogRef<TwilioIntegrationModalComponent>
  ) {}

  selectedCountry = {
    flag: '🇪🇸',
    dial_code: '+34'
  };
  
  countries = [
    { flag: '🇪🇸', code: '+34' },
    { flag: '🇺🇸', code: '+1' },
    { flag: '🇬🇧', code: '+44' },
    { flag: '🇫🇷', code: '+33' },
    { flag: '🇩🇪', code: '+49' },
    { flag: '🇲🇽', code: '+52' },
  ];
  
}
