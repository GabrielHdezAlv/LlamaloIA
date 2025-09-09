import { Component, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms'; // ✅ Importar FormsModule
import { UserStorage } from '../../storages/user/user-storage';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    FormsModule // ✅ Añadir aquí
    // Si usas otro módulo como NgIf, debes añadir CommonModule si es necesario
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
  setActiveTab(tab: 'profile' | 'security' | 'billing') {
    this.activeTab = tab;
  }

  

  

  // Método para actualizar contraseña
  updatePassword() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    // Aquí puedes enviar al backend
    console.log('Contraseña actualizada');
  }

  // Método para eliminar cuenta
  deleteAccount() {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta?')) {
      // Lógica de eliminación
      console.log('Cuenta eliminada');
    }
  }
}