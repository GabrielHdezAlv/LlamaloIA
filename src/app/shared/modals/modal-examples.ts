import { Injectable, inject } from '@angular/core';
import { ModalService } from './modal.service';

/**
 * Ejemplos de uso de los diferentes tipos de modales
 * Este archivo muestra cómo usar cada modal en tu aplicación
 */
@Injectable({
  providedIn: 'root'
})
export class ModalExamples {
  private modalService = inject(ModalService);

  // Ejemplo de uso del modal de error
  showErrorExample() {
    this.modalService.openError({
      title: 'Error de conexión',
      message: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.',
      details: 'Error 500: Internal Server Error\nTimestamp: 2024-01-15T10:30:00Z'
    });
  }

  // Ejemplo de uso del modal de eliminación de cuenta
  showDeleteAccountExample() {
    const dialogRef = this.modalService.openDeleteAccount({
      userName: 'Juan Pérez',
      message: '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Usuario confirmó la eliminación de cuenta');
        // Aquí iría la lógica para eliminar la cuenta
      } else {
        console.log('Usuario canceló la eliminación');
      }
    });
  }

  // Ejemplo de uso del modal de compra
  showPurchaseExample() {
    const dialogRef = this.modalService.openPurchase({
      title: 'Actualizar a Plan Premium',
      productName: 'Plan Premium',
      price: 29.99,
      currency: '€',
      description: 'Acceso completo a todas las funcionalidades',
      billingPeriod: 'monthly',
      features: [
        'Agentes ilimitados',
        'Llamadas sin límite',
        'Soporte prioritario',
        'Integraciones avanzadas',
        'Analytics detallados'
      ]
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Usuario confirmó la compra');
        // Aquí iría la lógica para procesar el pago
      } else {
        console.log('Usuario canceló la compra');
      }
    });
  }

  // Ejemplo de uso del modal de éxito
  showSuccessExample() {
    this.modalService.openSuccess({
      title: '¡Agente creado exitosamente!',
      message: 'Tu agente "Carlos" ha sido creado y está listo para recibir llamadas.',
      details: 'ID del agente: AGT-12345\nFecha de creación: 15/01/2024',
      showActionButton: true,
      actionButtonText: 'Configurar Agente'
    });
  }

  // Ejemplo de uso del modal de advertencia
  showWarningExample() {
    const dialogRef = this.modalService.openWarning({
      title: 'Cambios no guardados',
      message: 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardar?',
      details: 'Se perderán todos los cambios realizados en el formulario actual.',
      confirmText: 'Salir sin guardar',
      cancelText: 'Seguir editando'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Usuario confirmó salir sin guardar');
        // Aquí iría la lógica para salir sin guardar
      } else {
        console.log('Usuario decidió seguir editando');
      }
    });
  }

  // Ejemplo de uso del modal de advertencia para acciones críticas
  showCriticalWarningExample() {
    const dialogRef = this.modalService.openWarning({
      title: 'Eliminar Agente',
      message: '¿Estás seguro de que quieres eliminar este agente?',
      details: 'Esta acción eliminará permanentemente el agente y todas sus configuraciones. Las llamadas en curso se interrumpirán.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Usuario confirmó la eliminación del agente');
        // Aquí iría la lógica para eliminar el agente
      }
    });
  }
}

