import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
export class TwilioIntegrationModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<TwilioIntegrationModalComponent>);
  data = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  formEnabled: boolean = false;
  
  countries = [
    { flag: '🇪🇸', code: '+34' },
    { flag: '🇺🇸', code: '+1' },
    { flag: '🇬🇧', code: '+44' },
    { flag: '🇫🇷', code: '+33' },
    { flag: '🇩🇪', code: '+49' },
    { flag: '🇲🇽', code: '+52' },
  ];

  selectedCountry = this.countries[0];

  ngOnInit() {
    this.formEnabled = this.data?.formEnabled ?? false;
    this.initForm();

    if (!this.formEnabled) {
      this.form.disable();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      countryCode: [this.selectedCountry.code, Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[1-9][0-9]{5,14}$/)]
      ],
      twilioSid: ['', Validators.required],
      twilioToken: ['', Validators.required]
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
  
    this.dialogRef.close(this.form.value);
  }
}
