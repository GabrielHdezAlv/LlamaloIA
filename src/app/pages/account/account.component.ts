import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../shared/modals/modal.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
  activeTab: 'profile' | 'security' | 'billing' = 'profile'; 

  // Campos de contraseña
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  private modalService = inject(ModalService);

  // Método para cambiar de pestaña
  setActiveTab(tab: 'profile' | 'security' | 'billing') {
    this.activeTab = tab;
  }

  // Método para actualizar contraseña
  updatePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.modalService.openError({
        title: 'Contraseña inválida',
        message: 'Las contraseñas no coinciden',
      });
      return;
    }
    // Aquí puedes enviar al backend
    console.log('Contraseña actualizada');
  }

  // Método para eliminar cuenta
  deleteAccount() {
    const dialogRef = this.modalService.openDeleteAccount({
      userName: 'Anas Midoul', // Aquí podrías obtener el nombre del usuario desde un servicio
      message: '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        console.log('Usuario confirmó la eliminación de cuenta');
        // Aquí iría la lógica para eliminar la cuenta
        // Por ejemplo: llamar a un servicio que elimine la cuenta del backend
        this.modalService.openSuccess({
          title: 'Cuenta eliminada',
          message: 'Tu cuenta ha sido eliminada exitosamente.',
          details: 'Todos tus datos han sido eliminados permanentemente.'
        });
      } else if (result === 'support') {
        console.log('Usuario quiere contactar con soporte');
        // Aquí puedes agregar la lógica para contactar con soporte
        // Por ejemplo: abrir un enlace, mostrar información de contacto, etc.
        this.modalService.openSuccess({
          title: 'Contacto con soporte',
          message: 'Te hemos redirigido a nuestro equipo de soporte.',
          details: 'Nuestro equipo se pondrá en contacto contigo pronto.'
        });
      } else {
        console.log('Usuario canceló la eliminación');
      }
    });
  }
}