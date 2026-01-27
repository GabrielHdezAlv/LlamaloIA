import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TwilioService } from '../../../core/services/twilio.service';
import { ModalService } from '../modal.service';

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
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './import-number-modal.component.html',
  styleUrls: ['./import-number-modal.component.scss'],
})
export class ImportNumberModalComponent {
  dialogRef = inject(MatDialogRef<ImportNumberModalComponent>);
  data = inject<ImportNumberModalData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private twilioService = inject(TwilioService);
  private modalService = inject(ModalService);

  importForm: FormGroup;
  isLoading = false;

  // Propiedades para el selector de país
  showCountryMenu = false;
  selectedCountryCode = '+34';
  selectedCountry = 'es';

  constructor() {
    this.importForm = this.fb.group({
      phoneNumber: ['', Validators.required],
      label: ['']
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  toggleCountryMenu() {
    this.showCountryMenu = !this.showCountryMenu;
  }

  selectCountry(countryCode: string, code: string) {
    this.selectedCountryCode = code;
    this.selectedCountry = countryCode;
    this.showCountryMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target) return;

    // Buscar si el click fue dentro del dropdown o del menú
    const dropdown = target.closest('[class*="w-28"]') || target.closest('[class*="w-36"]');
    const menu = target.closest('ul');
    const menuItem = target.closest('li');

    // Solo cerrar si el click fue fuera del dropdown y del menú
    if (!dropdown && !menu && !menuItem) {
      this.showCountryMenu = false;
    }
  }

  onSubmit(): void {
    if (this.importForm.valid) {
      const phoneNumber = this.importForm.get('phoneNumber')?.value?.trim();
      
      if (!phoneNumber) {
        this.modalService.openError({
          title: 'Número de teléfono requerido',
          message: 'Por favor, ingresa un número de teléfono válido.'
        });
        return;
      }

      const countryCode = this.selectedCountryCode;
      const number = phoneNumber;
      
      console.log('🔍 Validando número de teléfono:', { countryCode, number });
      
      this.isLoading = true;

      // Primero validar el número de teléfono
      this.twilioService.validatePhone(countryCode, number).subscribe({
        next: (response) => {
          console.log('✅ Número validado correctamente:', response);
          this.isLoading = false;
          
          // Si la validación es exitosa, cerrar el modal con los datos
          this.dialogRef.close({
            ...this.importForm.value,
            countryCode: this.selectedCountryCode,
            country: this.selectedCountry
          });
        },
        error: (error) => {
          console.error('❌ Error al validar número:', error);
          this.isLoading = false;
          
          // Manejar diferentes tipos de errores
          let errorMessage = 'Error al validar el número de teléfono. Por favor, intenta nuevamente.';
          
          if (error.status === 400) {
            errorMessage = error?.error?.message || 'Número no disponible. Por favor, verifica que el número sea correcto y esté disponible en Twilio.';
          } else if (error.status === 401) {
            errorMessage = 'Token inválido o expirado. Por favor, inicia sesión nuevamente.';
          } else if (error.status === 404) {
            errorMessage = 'Usuario no encontrado o configuración de Twilio no encontrada. Por favor, verifica tu configuración en Ajustes > Conexiones > Twilio.';
          } else if (error?.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.modalService.openError({
            title: 'Error al validar número',
            message: errorMessage
          });
        }
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.importForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    return '';
  }
}

