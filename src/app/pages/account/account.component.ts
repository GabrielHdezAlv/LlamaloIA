import { Component, inject, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserStorage } from '../../storages/user/user-storage';
import { UserService } from '../../core/services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ModalService } from '../../shared/modals/modal.service';
import { I18nService } from '../../core/services/i18n.service';
import { RippleButtonComponent } from '../../shared/components/ripple-button/ripple-button.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [FormsModule, MatSnackBarModule, CommonModule, RippleButtonComponent],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss', './billing-modal-blur.scss'],
})
export class AccountComponent implements OnInit {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private i18nService = inject(I18nService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  activeTab: 'profile' | 'security' | 'billing' | 'gifts' = 'profile';
  showBillingModal = false;
  showAvatarModal = false;
  
  // Avatares predeterminados
  defaultAvatars = [
    'assets/animoji_1.webp',
    'assets/animoji_2.webp',
    'assets/animoji_3.webp',
    'assets/animoji_4.webp',
    'assets/animoji_5.webp',
    'assets/animoji_6.webp',
    'assets/animoji_7.webp',
    'assets/animoji_8.webp',
    'assets/animoji_9.webp',
    'assets/animoji_10.webp',
    
    
  ];

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

  // Facturación
  currentPlanMinutes: number | null = null;

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

  // Traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  // Método para cambiar de pestaña
  setActiveTab(tab: 'profile' | 'security' | 'billing' | 'gifts') {
    this.activeTab = tab;
  }

  userProfileImage = computed(() => this.user()?.profileImage ?? '');
  enterprise = computed(() => this.user()?.enterprise ?? '');
  enterpriseWeb = computed(() => this.user()?.enterpriseWeb ?? '');

  ngOnInit() {
    this.i18nService.initializeLanguage();
    
    const user = this.user();
    if (user) {
      this.tempName = user.name || '';
      this.tempLastname = user.lastname || '';
      this.tempCountry = user.country || '';
      this.tempEnterprise = user.enterprise || '';
      this.tempEnterpriseWeb = user.enterpriseWeb || '';
      this.tempProfileImage = user.profileImage || '';
    }
    
    // Inicializar el slider del modal de facturación
    setTimeout(() => {
      this.updateSliderBackground();
    }, 100);

    // Verificar si hay parámetros de consulta para activar una pestaña específica
    this.route.queryParams.subscribe(params => {
      console.log('Query params:', params); // Debug log
      if (params['tab'] === 'gifts') {
        console.log('Activating gifts tab'); // Debug log
        this.setActiveTab('gifts');
        // Limpiar el parámetro de consulta después de un pequeño delay
         setTimeout(() => {
           this.router.navigate([], {
             relativeTo: this.route,
             queryParams: {},
             replaceUrl: true
           });
         }, 10);
      }
    });
  }

  // Método para actualizar contraseña
  updatePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.modalService.openError({
        title: this.t.invalidPassword,
        message: this.t.passwordsDoNotMatch,
      });
      return;
    }
    
    // Aquí puedes enviar al backend
    console.log('Contraseña actualizada');
    
    // Mostrar modal de éxito en lugar de notificación básica
    this.modalService.openPasswordSuccess({
      title: 'Contraseña actualizada',
      message: 'Tu contraseña ha sido actualizada correctamente. Te recomendamos cerrar sesión y volver a iniciar sesión con tu nueva contraseña.',
      showContinueButton: true,
      continueButtonText: 'Entendido'
    });
    
    // Limpiar los campos después del éxito
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  onAvatarClick() {
    // Abrir modal de selección de avatar
    this.showAvatarModal = true;
  }

  openAvatarModal() {
    this.showAvatarModal = true;
  }

  closeAvatarModal() {
    this.showAvatarModal = false;
  }

  selectDefaultAvatar(avatarUrl: string) {
    this.tempProfileImage = avatarUrl;
    this.showAvatarModal = false;
    // Actualizar el perfil inmediatamente
    const currentUser = this.user();
    if (currentUser) {
      // NO incluir email ni country (el backend no los acepta)
      const updatedUserData = {
        name: this.tempName,
        lastname: this.tempLastname,
        profileImage: avatarUrl,
        enterprise: this.tempEnterprise,
        enterpriseWeb: this.tempEnterpriseWeb,
      };

      this.userService.updateUserProfile(updatedUserData).subscribe({
        next: (response: any) => {
          this.userStore.setUser(response);
          this.showNotification('Avatar actualizado correctamente', 'success');
        },
        error: (error: any) => {
          this.showNotification('Error al actualizar el avatar', 'error');
        },
      });
    }
  }

  onUploadPhotoClick() {
    // Crear input file oculto
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadProfileImage(file);
        this.showAvatarModal = false;
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

    // NO incluir email ni country (el backend no los acepta)
    const updatedUserData = {
      name: this.tempName,
      lastname: this.tempLastname,
      profileImage: this.tempProfileImage,
      enterprise: this.tempEnterprise,
      enterpriseWeb: this.tempEnterpriseWeb,
    };

    this.userService.updateUserProfile(updatedUserData).subscribe({
      next: (response: any) => {
        this.userStore.setUser(response);
        this.showNotification(this.t.profileUpdated, 'success');
      },
      error: (error: any) => {
        this.showNotification(this.t.errorUpdatingProfile, 'error');
      },
    });
  }

  // Propiedades para el modal de facturación
  selectedMinutes: number = 700;
  selectedPlan: any = {
    targetAudience: 'For individuals',
    name: 'Advanced',
    description: 'Show social proof notifications to increase leads and sales.',
    price: 99,
    features: [
      'All analytics features',
      'Up to 250,000 tracked visits',
      'Normal support',
      'Up to 3 team members'
    ]
  };

  // Métodos para el modal de facturación
  openBillingModal() {
    this.showBillingModal = true;
  }

  closeBillingModal(event?: Event) {
    if (event && event.target !== event.currentTarget) {
      return;
    }
    this.showBillingModal = false;
  }

  onMinutesChange(event: any) {
    this.selectedMinutes = parseInt(event.target.value);
    this.updateSliderBackground();
  }

  updateSliderBackground() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const percentage = ((this.selectedMinutes - 100) / (2000 - 100)) * 100;
    const slider = document.querySelector('.slider') as HTMLInputElement;
    if (slider) {
      slider.style.setProperty('--progress', `${percentage}%`);
    }
  }

  private isDragging = false;

  getSliderThumbPosition(): string {
    const percentage = Math.min(100, Math.max(0, ((this.selectedMinutes - 100) / (2000 - 100)) * 100));
    
    if (this.selectedMinutes === 2000) {
      return 'calc(100% - 12px)'; // Llega al final sin espacio
    } else if (this.selectedMinutes === 100) {
      return '0px'; // Comienza desde el inicio
    } else {
      return `calc(${percentage}% - 12px)`; // Centrado en posiciones intermedias
    }
  }

  onSliderTrackClick(event: MouseEvent) {
    const sliderTrack = event.currentTarget as HTMLElement;
    const rect = sliderTrack.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    // Convertir porcentaje a valor entre 100 y 2000
    const value = Math.round(100 + (percentage / 100) * (2000 - 100));
    const stepValue = Math.round(value / 50) * 50; // Redondear al step más cercano
    
    this.selectedMinutes = Math.max(100, Math.min(2000, stepValue));
  }

  startDragging(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    event.preventDefault();
    event.stopPropagation();
    
    const sliderContainer = (event.target as HTMLElement).closest('.relative') as HTMLElement;
    
    const handleMouseMove = (e: Event) => {
      if (!this.isDragging || !sliderContainer) return;
      
      e.preventDefault();
      
      const mouseEvent = e as MouseEvent;
      const touchEvent = e as TouchEvent;
      const clientX = touchEvent.touches ? touchEvent.touches[0].clientX : mouseEvent.clientX;
      
      const rect = sliderContainer.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      
      // Convertir porcentaje a valor entre 100 y 2000
      const value = Math.round(100 + (percentage / 100) * (2000 - 100));
      const stepValue = Math.round(value / 50) * 50; // Redondear al step más cercano
      
      this.selectedMinutes = Math.max(100, Math.min(2000, stepValue));
    };

    const handleMouseUp = (e: Event) => {
      this.isDragging = false;
      e.preventDefault();
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);
  }

  getStarted() {
    console.log('Plan seleccionado:', this.selectedPlan);
    console.log('Minutos seleccionados:', this.selectedMinutes);
    // Aquí implementarías la lógica para procesar el pago
  }
}
