import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TwilioConfig } from '../../../shared/models/twilio-config.model';
import { TwilioStorage } from '../../../storages/twilio/twilio-storage';
import { TwilioService } from '../../../core/services/twilio.service';

@Component({
  selector: 'app-twilio-integration-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './twilio-integration-modal.component.html',
  styleUrls: ['./twilio-integration-modal.component.scss'],
})
export class TwilioIntegrationModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private twilioStorage = inject(TwilioStorage);
  private twilioService = inject(TwilioService);

  form!: FormGroup;
  formEnabled: boolean = false;

  countries = [
    { flag: 'https://flagcdn.com/w40/es.png', code: '+34' },
    { flag: 'https://flagcdn.com/w40/us.png', code: '+1' },
    { flag: 'https://flagcdn.com/w40/gb.png', code: '+44' },
    { flag: 'https://flagcdn.com/w40/fr.png', code: '+33' },
    { flag: 'https://flagcdn.com/w40/de.png', code: '+49' },
    { flag: 'https://flagcdn.com/w40/mx.png', code: '+52' },
  ];

  selectedCountry = this.countries[0];

  ngOnInit() {
    this.formEnabled = this.data?.formEnabled ?? false;
    this.initForm();

    // Si hay configuración existente, rellenar el formulario
    if (this.data?.config) {
      const config = this.data.config;

      // Encontrar el país correspondiente al código
      const country = this.countries.find((c) => c.code === config.countryCode);
      if (country) {
        this.selectedCountry = country;
      }

      this.form.patchValue({
        countryCode: config.countryCode,
        phoneNumber: config.phoneNumber,
        twilioSid: config.twilioSid,
        twilioToken: config.twilioToken,
      });
    }

    if (!this.formEnabled) {
      this.form.disable();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      countryCode: [this.selectedCountry.code, Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[1-9][0-9]{5,14}$/)],
      ],
      twilioSid: ['', Validators.required],
      twilioToken: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (!this.formEnabled) {
      this.formEnabled = true;
      this.form.enable();
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const config: TwilioConfig = {
      countryCode: this.form.get('countryCode')?.value,
      phoneNumber: Number(this.form.get('phoneNumber')?.value),
      twilioSid: this.form.get('twilioSid')?.value,
      twilioToken: this.form.get('twilioToken')?.value,
    };

    // Guardar en el storage local
    this.twilioStorage.setConfig(config);

    // Guardar en la base de datos
    this.twilioService.setConfig(config).subscribe({
      next: () => {
        this.dialogRef.close(config);
      },
      error: (error) => {
        console.error('Error al guardar la configuración:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
      },
    });
  }
}
