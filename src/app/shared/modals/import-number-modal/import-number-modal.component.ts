import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

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
      console.log('Formulario enviado:', {
        ...this.importForm.value,
        countryCode: this.selectedCountryCode,
        country: this.selectedCountry
      });
      this.dialogRef.close(this.importForm.value);
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

