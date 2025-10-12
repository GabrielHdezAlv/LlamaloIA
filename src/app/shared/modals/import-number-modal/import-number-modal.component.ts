import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

export interface ImportNumberModalData {
  title?: string;
  message?: string;
}

@Component({
  selector: 'app-import-number-modal',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './import-number-modal.component.html',
  styleUrls: ['./import-number-modal.component.scss'],
})
export class ImportNumberModalComponent {
  dialogRef = inject(MatDialogRef<ImportNumberModalComponent>);
  data = inject<ImportNumberModalData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  importForm: FormGroup;
  isLoading = false;

  // Opciones para el select de proveedor
  providers = [
    { value: 'twilio', label: 'Twilio' },
    { value: 'vonage', label: 'Vonage' },
    { value: 'plivo', label: 'Plivo' },
    { value: 'other', label: 'Otro' }
  ];

  constructor() {
    this.importForm = this.fb.group({
      phoneNumber: ['', Validators.required],
      twilioSid: ['', Validators.required],
      twilioToken: ['', Validators.required],
      label: ['']
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    // No funcional - solo para mostrar el diseño
    console.log('Formulario enviado:', this.importForm.value);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.importForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field?.hasError('pattern') && fieldName === 'phoneNumber') {
      return 'Formato de número de teléfono inválido';
    }
    return '';
  }
}

