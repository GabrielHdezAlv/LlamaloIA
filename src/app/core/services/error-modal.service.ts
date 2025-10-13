import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorModalComponent, ErrorModalData } from '../../shared/components/error-modal/error-modal.component';

export interface ErrorDetails {
  title?: string;
  message: string;
  details?: string;
  type?: 'error' | 'warning' | 'info';
  showDetails?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorModalService {
  private dialog = inject(MatDialog);

  showError(errorDetails: ErrorDetails) {
    const data: ErrorModalData = {
      title: errorDetails.title || 'Error',
      message: errorDetails.message,
      details: errorDetails.details,
      type: errorDetails.type || 'error',
      showDetails: errorDetails.showDetails || false
    };

    return this.dialog.open(ErrorModalComponent, {
      data,
      width: '500px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      panelClass: 'error-modal-panel',
      closeOnNavigation: true,
      hasBackdrop: true
    });
  }

  // Métodos específicos para diferentes tipos de errores
  showLoginError(error: any) {
    let message = 'Error al iniciar sesión';
    let details = '';

    // Mensajes específicos según el tipo de error
    if (error?.status === 400) {
      message = 'Datos de login incorrectos';
      details = 'El email o la contraseña que ingresaste no son válidos. Verifica que ambos campos estén completos y sean correctos.';
    } else if (error?.status === 401) {
      message = 'Credenciales incorrectas';
      details = 'El email o la contraseña que ingresaste no son correctos. Verifica tus datos e intenta nuevamente.';
    } else if (error?.status === 403) {
      message = 'Cuenta bloqueada o inactiva';
      details = 'Tu cuenta está bloqueada o inactiva. Contacta al soporte técnico para más información.';
    } else if (error?.status === 429) {
      message = 'Demasiados intentos';
      details = 'Has realizado demasiados intentos de inicio de sesión. Espera unos minutos antes de intentar nuevamente.';
    } else if (error?.status === 500) {
      message = 'Error del servidor';
      details = 'Ha ocurrido un error interno del servidor. Intenta nuevamente en unos minutos.';
    } else if (error?.status === 0 || !error?.status) {
      message = 'Error de conexión';
      details = 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.';
    } else {
      // Para otros errores, usar mensajes del servidor si están disponibles
      if (error?.error?.message && typeof error.error.message === 'string' && !error.error.message.includes('Http failure response')) {
        message = error.error.message;
      } else if (error?.message && typeof error.message === 'string' && !error.message.includes('Http failure response')) {
        message = error.message;
      }
      
      // Solo mostrar detalles técnicos si no es un mensaje HTTP crudo
      if (error?.error?.details && !error.error.details.includes('Http failure response')) {
        details = error.error.details;
      } else if (error?.details && !error.details.includes('Http failure response')) {
        details = error.details;
      }
    }

    return this.showError({
      title: 'Error de Inicio de Sesión',
      message,
      details,
      type: 'error',
      showDetails: !!details
    });
  }

  showRegisterError(error: any) {
    let message = 'Error al registrarse';
    let details = '';

    // Mensajes específicos según el tipo de error
    if (error?.status === 400) {
      message = 'Datos inválidos';
      details = 'Los datos que ingresaste no son válidos. Verifica que todos los campos estén completos y sean correctos.';
    } else if (error?.status === 409) {
      message = 'Email ya registrado';
      details = 'El email que ingresaste ya está registrado. Intenta iniciar sesión o usa un email diferente.';
    } else if (error?.status === 422) {
      message = 'Datos de registro inválidos';
      details = 'Algunos de los datos proporcionados no cumplen con los requisitos. Verifica el formato del email y la fortaleza de la contraseña.';
    } else if (error?.status === 500) {
      message = 'Error del servidor';
      details = 'Ha ocurrido un error interno del servidor durante el registro. Intenta nuevamente en unos minutos.';
    } else if (error?.status === 0 || !error?.status) {
      message = 'Error de conexión';
      details = 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.';
    } else {
      // Para otros errores, usar mensajes del servidor si están disponibles
      if (error?.error?.message && typeof error.error.message === 'string' && !error.error.message.includes('Http failure response')) {
        message = error.error.message;
      } else if (error?.message && typeof error.message === 'string' && !error.message.includes('Http failure response')) {
        message = error.message;
      }
      
      // Solo mostrar detalles técnicos si no es un mensaje HTTP crudo
      if (error?.error?.details && !error.error.details.includes('Http failure response')) {
        details = error.error.details;
      } else if (error?.details && !error.details.includes('Http failure response')) {
        details = error.details;
      }
    }

    return this.showError({
      title: 'Error de Registro',
      message,
      details,
      type: 'error',
      showDetails: !!details
    });
  }

  showRecoverError(error: any) {
    let message = 'Error al recuperar contraseña';
    let details = '';

    // Mensajes específicos según el tipo de error
    if (error?.status === 404) {
      message = 'Email no encontrado';
      details = 'El email que ingresaste no está registrado en nuestro sistema. Verifica que sea correcto.';
    } else if (error?.status === 429) {
      message = 'Demasiados intentos';
      details = 'Has solicitado demasiados envíos de recuperación. Espera unos minutos antes de intentar nuevamente.';
    } else if (error?.status === 500) {
      message = 'Error del servidor';
      details = 'Ha ocurrido un error interno del servidor. Intenta nuevamente en unos minutos.';
    } else if (error?.status === 0 || !error?.status) {
      message = 'Error de conexión';
      details = 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.';
    } else {
      // Para otros errores, usar mensajes del servidor si están disponibles
      if (error?.error?.message && typeof error.error.message === 'string' && !error.error.message.includes('Http failure response')) {
        message = error.error.message;
      } else if (error?.message && typeof error.message === 'string' && !error.message.includes('Http failure response')) {
        message = error.message;
      }
      
      // Solo mostrar detalles técnicos si no es un mensaje HTTP crudo
      if (error?.error?.details && !error.error.details.includes('Http failure response')) {
        details = error.error.details;
      } else if (error?.details && !error.details.includes('Http failure response')) {
        details = error.details;
      }
    }

    return this.showError({
      title: 'Error de Recuperación',
      message,
      details,
      type: 'error',
      showDetails: !!details
    });
  }

  showGenericError(title: string, message: string, error?: any) {
    let details = '';
    
    // Solo mostrar detalles si no son mensajes HTTP crudos
    if (error?.error?.details && !error.error.details.includes('Http failure response')) {
      details = error.error.details;
    } else if (error?.details && !error.details.includes('Http failure response')) {
      details = error.details;
    } else if (error?.error?.message && !error.error.message.includes('Http failure response')) {
      details = error.error.message;
    } else if (error?.message && !error.message.includes('Http failure response')) {
      details = error.message;
    }

    return this.showError({
      title,
      message,
      details,
      type: 'error',
      showDetails: !!details
    });
  }
}
