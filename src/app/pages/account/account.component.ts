import { Component, inject, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserStorage } from '../../storages/user/user-storage';
import { UserService } from '../../core/services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../shared/modals/modal.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [FormsModule, MatSnackBarModule, CommonModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  activeTab: 'profile' | 'security' | 'billing' | 'gifts' = 'profile';

  // Campos de contraseña
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  private modalService = inject(ModalService);

  // Campos temporales para el formulario
  tempName = '';
  tempLastname = '';
  tempCountry = '';
  tempEnterprise = '';
  tempEnterpriseWeb = '';
  tempProfileImage = '';

  // Usuario actual
  private userStore = inject(UserStorage);
  user = this.userStore.user;

  // Derivados para mostrar en plantilla
  fullName = computed(() => {
    const u = this.user();
    const name = u?.name ?? '';
    const last = u?.lastname ?? '';
    return `${name} ${last}`.trim();
  });

  email = computed(() => this.user()?.email ?? '');

  // Método para cambiar de pestaña
  setActiveTab(tab: 'profile' | 'security' | 'billing' | 'gifts') {
    this.activeTab = tab;
  }

  userProfileImage = computed(() => this.user()?.profileImage ?? '');
  enterprise = computed(() => this.user()?.enterprise ?? '');
  enterpriseWeb = computed(() => this.user()?.enterpriseWeb ?? '');

  ngOnInit() {
    const user = this.user();
    if (user) {
      this.tempName = user.name || '';
      this.tempLastname = user.lastname || '';
      this.tempCountry = user.country || '';
      this.tempEnterprise = user.enterprise || '';
      this.tempEnterpriseWeb = user.enterpriseWeb || '';
      this.tempProfileImage = user.profileImage || '';
    }
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

  onAvatarClick() {
    // Crear input file oculto
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadProfileImage(file);
      }
    };
    input.click();
  }

  uploadProfileImage(file: File) {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.showNotification(
        'Por favor, selecciona un archivo de imagen válido',
        'error'
      );
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showNotification('La imagen debe ser menor a 5MB', 'error');
      return;
    }

    // Mostrar notificación de carga
    this.showNotification('Subiendo imagen...', 'success');

    console.log('this.user()?.userId: ', this.user()?.userId);

    // Llamar al endpoint para subir la imagen
    this.userService.uploadProfileImage(file).subscribe({
      next: (response: any) => {
        this.tempProfileImage = response.imageUrl;
        this.showNotification('Imagen subida correctamente', 'success');
      },
      error: (error: any) => {
        console.error('Error al subir imagen:', error);
        this.showNotification(
          'Error al subir la imagen. Inténtalo de nuevo.',
          'error'
        );
      },
    });
  }

  // Método para eliminar cuenta
  deleteAccount() {
    const dialogRef = this.modalService.openDeleteAccount({
      userName: this.fullName(),
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

  // Método para canjear recompensa
  redeemReward(rewardType: string) {
    console.log(`Canjeando recompensa: ${rewardType}`);
    // Aquí puedes implementar la lógica para canjear la recompensa
    alert(`¡Recompensa ${rewardType} canjeada! Te contactaremos pronto.`);
  }

  private showNotification(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  saveUserInfo() {
    const currentUser = this.user();
    if (!currentUser) {
      console.error('No hay usuario logueado');
      return;
    }

    const updatedUserData = {
      name: this.tempName,
      lastname: this.tempLastname,
      email: currentUser.email,
      country: this.tempCountry,
      profileImage: this.tempProfileImage,
      enterprise: this.tempEnterprise,
      enterpriseWeb: this.tempEnterpriseWeb,
    };

    this.userService.updateUserProfile(updatedUserData).subscribe({
      next: (response: any) => {
        this.userStore.setUser(response);
        this.showNotification('Perfil actualizado correctamente', 'success');
      },
      error: (error: any) => {
        this.showNotification(
          'Error al actualizar el perfil. Por favor, inténtalo de nuevo.',
          'error'
        );
      },
    });
  }
}
