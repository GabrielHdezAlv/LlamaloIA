// Ejemplo de uso del modal de éxito de contraseña

import { Component, inject } from '@angular/core';
import { ModalService } from '../modal.service';
import { PasswordSuccessModalData } from './password-success-modal.component';

@Component({
  selector: 'app-example',
  template: `
    <button (click)="showPasswordSuccessModal()">
      Mostrar Modal de Éxito de Contraseña
    </button>
  `,
})
export class ExampleComponent {
  private modalService = inject(ModalService);

  showPasswordSuccessModal() {
    // Uso básico con datos por defecto
    const dialogRef = this.modalService.openPasswordSuccess();

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'continue') {
        // Aquí puedes redirigir o realizar otras acciones
      } else {
      }
    });
  }

  showPasswordSuccessModalWithCustomData() {
    // Uso con datos personalizados
    const customData: PasswordSuccessModalData = {
      title: '¡Contraseña actualizada!',
      message:
        'Tu nueva contraseña ha sido configurada correctamente y ya está activa.',
      showContinueButton: true,
      continueButtonText: 'Ir al Dashboard',
    };

    const dialogRef = this.modalService.openPasswordSuccess(customData);

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'continue') {
        // Redirigir al dashboard o realizar acción específica
      }
    });
  }

  showPasswordSuccessModalMinimal() {
    // Uso mínimo sin botón de continuar
    const minimalData: PasswordSuccessModalData = {
      title: 'Contraseña cambiada',
      message: 'Tu contraseña ha sido actualizada exitosamente.',
      showContinueButton: false,
    };

    this.modalService.openPasswordSuccess(minimalData);
  }
}

// Ejemplo de uso en un servicio de autenticación
export class AuthService {
  private modalService = inject(ModalService);
  // private apiService = inject(ApiService); // Inyectar el servicio de API que uses

  async updatePassword(newPassword: string) {
    try {
      // Lógica para actualizar la contraseña
      // await this.apiService.updatePassword(newPassword);

      // Mostrar modal de éxito
      this.modalService.openPasswordSuccess({
        title: 'Contraseña actualizada',
        message:
          'Tu contraseña ha sido cambiada correctamente. Te recomendamos cerrar sesión y volver a iniciar sesión.',
        showContinueButton: true,
        continueButtonText: 'Entendido',
      });
    } catch (error) {
      // Manejar error
      console.error('Error al actualizar contraseña:', error);
    }
  }
}
