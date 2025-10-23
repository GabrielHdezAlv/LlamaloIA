// Ejemplo de uso del modal de éxito de inicio de sesión

import { Component, inject } from '@angular/core';
import { ModalService } from '../modal.service';
import { LoginSuccessModalData } from './login-success-modal.component';

@Component({
  selector: 'app-example',
  template: `
    <button (click)="showLoginSuccessModal()">
      Mostrar Modal de Éxito de Inicio de Sesión
    </button>
  `
})
export class ExampleComponent {
  private modalService = inject(ModalService);

  showLoginSuccessModal() {
    // Uso básico con datos por defecto
    const dialogRef = this.modalService.openLoginSuccess();
    
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'continue') {
        console.log('Usuario hizo clic en continuar');
        // Aquí puedes redirigir o realizar otras acciones
      } else {
        console.log('Usuario cerró el modal');
      }
    });
  }

  showLoginSuccessModalWithCustomData() {
    // Uso con datos personalizados
    const customData: LoginSuccessModalData = {
      title: '¡Bienvenido de vuelta!',
      message: 'Hola Juan, has iniciado sesión correctamente.',
      userName: 'Juan',
      showContinueButton: true,
      continueButtonText: 'Ir al Dashboard'
    };

    const dialogRef = this.modalService.openLoginSuccess(customData);
    
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'continue') {
        // Redirigir al dashboard
        console.log('Redirigiendo al dashboard...');
      }
    });
  }

  showLoginSuccessModalForNewUser() {
    // Uso para nuevo usuario registrado
    const newUserData: LoginSuccessModalData = {
      title: '¡Bienvenido!',
      message: 'Hola María, tu cuenta ha sido creada exitosamente.',
      userName: 'María',
      showContinueButton: true,
      continueButtonText: 'Comenzar'
    };

    this.modalService.openLoginSuccess(newUserData);
  }
}

// Ejemplo de uso en un servicio de autenticación
export class AuthService {
  private modalService = inject(ModalService);
  // private apiService = inject(ApiService); // Inyectar el servicio de API que uses

  async loginUser(email: string, password: string) {
    try {
      // Lógica para iniciar sesión
      // const response = await this.apiService.login(email, password);
      
      // Mostrar modal de éxito
      this.modalService.openLoginSuccess({
        title: '¡Bienvenido de vuelta!',
        message: 'Has iniciado sesión correctamente.',
        showContinueButton: true,
        continueButtonText: 'Ir al Dashboard'
      });
      
      // return response;
      
    } catch (error) {
      // Manejar error
      console.error('Error al iniciar sesión:', error);
    }
  }
}
