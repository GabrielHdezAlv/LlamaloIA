import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './twilio-integration-modal.component.html',
  styleUrl: './twilio-integration-modal.component.scss',
})
export class TwilioIntegrationModalComponent {
  form: FormGroup;

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

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TwilioIntegrationModalComponent>
  ) {
    this.form = this.fb.group({
      countryCode: [this.selectedCountry.dial_code, Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[1-9][0-9]{5,14}$/)]
      ],
      twilioSid: ['', Validators.required],
      twilioToken: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = this.form.value;
      console.log('Datos del formulario:', formData);
      this.dialogRef.close(formData);
    } else {
      this.form.markAllAsTouched();
    }
  }

}
