import {
  Component,
  inject,
  computed,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserStorage } from '../../storages/user/user-storage';
import { UserService } from '../../core/services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ModalService } from '../../shared/modals/modal.service';
import { I18nService } from '../../core/services/i18n.service';
import { RippleButtonComponent } from '../../shared/components/ripple-button/ripple-button.component';
import { AnimatedCheckboxComponent } from '../../shared/components/animated-checkbox/animated-checkbox.component';
import { TwilioService } from '../../core/services/twilio.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    FormsModule,
    MatSnackBarModule,
    CommonModule,
    RippleButtonComponent,
    AnimatedCheckboxComponent,
  ],
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
  private twilioService = inject(TwilioService);

  activeTab: 'profile' | 'security' | 'billing' | 'gifts' | 'connections' =
    'profile';
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
  newPassword = '';
  confirmPassword = '';

  private modalService = inject(ModalService);

  // Campos temporales para el formulario
  tempName = '';
  tempLastname = '';
  tempFullName = '';
  tempCountry = '';
  tempMarketingConsent: boolean = false;
  tempEnterprise: { name: string; url: string } = { name: '', url: '' };
  tempProfileImage = '';
  pendingImageFile: File | undefined;

  // Lista de países con códigos ISO
  countries = [
    { code: 'ES', name: 'España' },
    { code: 'FR', name: 'Francia' },
    { code: 'IT', name: 'Italia' },
    { code: 'PT', name: 'Portugal' },
    { code: 'DE', name: 'Alemania' },
    { code: 'GB', name: 'Reino Unido' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'MX', name: 'México' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CO', name: 'Colombia' },
  ];

  // Facturación
  currentPlanMinutes: number | null = null;

  // Integraciones
  showTwilioConfig = false;
  twilioSid = '';
  twilioToken = '';
  twilioAccountId?: number; // ⚠️ NUEVO: para editar cuenta existente
  isLoadingTwilio = false;
  twilioAccounts: Array<{
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  }> = [];

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

  // Información de eliminación programada
  scheduledDeletionDate = computed(
    () => this.user()?.scheduledDeletionDate ?? null,
  );

  daysRemaining = computed(() => {
    const deletionDate = this.scheduledDeletionDate();
    if (!deletionDate) return null;

    const now = new Date();
    const deletion = new Date(deletionDate);
    const diffTime = deletion.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  });

  // Traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  // Método para cambiar de pestaña
  setActiveTab(
    tab: 'profile' | 'security' | 'billing' | 'gifts' | 'connections',
  ) {
    this.activeTab = tab;
    // Cargar cuentas de Twilio cuando se abre la pestaña de conexiones
    if (tab === 'connections') {
      this.loadTwilioAccounts();
    }
  }

  userProfileImage = computed(() => this.user()?.profileImage ?? '');
  enterprise = computed(() => {
    const ent = this.user()?.enterprise;
    return ent?.name || '';
  });
  enterpriseWeb = computed(() => {
    const ent = this.user()?.enterprise;
    return ent?.url || '';
  });

  ngOnInit() {
    this.i18nService.initializeLanguage();

    const user = this.user();
    if (user) {
      this.tempName = user.name || '';
      this.tempLastname = user.lastname || '';
      // Inicializar nombre completo combinando name y lastname
      this.tempFullName = `${user.name || ''} ${user.lastname || ''}`.trim();
      this.tempCountry = user.country || '';
      this.tempMarketingConsent = user.marketingConsent || false;
      // Inicializar enterprise como objeto
      this.tempEnterprise = user.enterprise || { name: '', url: '' };
      this.tempProfileImage = user.profileImage || '';

      // Cargar cuentas de Twilio si el usuario tiene
      if (user.twilio && Array.isArray(user.twilio)) {
        this.twilioAccounts = user.twilio.map((account) => ({
          twilioAccountId: account.twilioAccountId,
          twilioSid: account.twilioSid,
          twilioToken: account.twilioToken,
        }));
      }
    }

    // Inicializar el slider del modal de facturación
    setTimeout(() => {
      this.updateSliderBackground();
    }, 100);

    // Verificar si hay parámetros de consulta para activar una pestaña específica
    this.route.queryParams.subscribe((params) => {
      console.log('Query params:', params); // Debug log
      if (params['tab'] === 'gifts') {
        console.log('Activating gifts tab'); // Debug log
        this.setActiveTab('gifts');
        // Limpiar el parámetro de consulta después de un pequeño delay
        setTimeout(() => {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true,
          });
        }, 10);
      }

      if (params['tab'] === 'connections') {
        this.setActiveTab('connections');
        setTimeout(() => {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true,
          });
        }, 10);
      }
    });
  }

  // Método para actualizar contraseña
  updatePassword() {
    // Validar que las contraseñas no estén vacías
    if (!this.newPassword || !this.confirmPassword) {
      this.modalService.openError({
        title: this.t.invalidPassword || 'Error',
        message: 'Por favor, completa ambos campos de contraseña',
      });
      return;
    }

    // Validar longitud mínima de 8 caracteres
    if (this.newPassword.length < 8) {
      this.modalService.openError({
        title: this.t.invalidPassword || 'Error',
        message: 'La contraseña debe tener al menos 8 caracteres',
      });
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.newPassword !== this.confirmPassword) {
      this.modalService.openError({
        title: this.t.invalidPassword || 'Error',
        message: this.t.passwordsDoNotMatch || 'Las contraseñas no coinciden',
      });
      return;
    }

    // Llamar al endpoint para cambiar la contraseña
    this.userService
      .changePassword(this.newPassword, this.confirmPassword)
      .subscribe({
        next: (response) => {
          // Mostrar modal de éxito
          this.modalService.openPasswordSuccess({
            title: 'Contraseña actualizada',
            message:
              'Tu contraseña ha sido actualizada correctamente. Te recomendamos cerrar sesión y volver a iniciar sesión con tu nueva contraseña.',
            showContinueButton: true,
            continueButtonText: 'Entendido',
          });

          // Limpiar los campos después del éxito
          this.newPassword = '';
          this.confirmPassword = '';
        },
        error: (error) => {
          // Manejar errores del backend
          let errorMessage = 'Error al actualizar la contraseña';

          if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }

          this.modalService.openError({
            title: 'Error',
            message: errorMessage,
          });
        },
      });
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
    // Limpiar cualquier archivo de imagen pendiente al seleccionar avatar por defecto
    this.pendingImageFile = undefined;
    // Actualizar el perfil inmediatamente
    const currentUser = this.user();
    if (currentUser) {
      // Dividir el nombre completo en name y lastname
      const fullNameParts = this.tempFullName.trim().split(/\s+/);
      let name = '';
      let lastname = '';

      if (fullNameParts.length > 0) {
        name = fullNameParts[0];
        if (fullNameParts.length > 1) {
          // Todo lo demás es el apellido
          lastname = fullNameParts.slice(1).join(' ');
        }
      }

      // Construir el objeto enterprise con los valores de los inputs
      const enterprise = {
        name: this.tempEnterprise.name || '',
        url: this.tempEnterprise.url || '',
      };

      // Actualizar perfil con country y marketingConsent (ahora permitidos)
      const updatedUserData = {
        name: name,
        lastname: lastname,
        profileImage: avatarUrl,
        enterprise: enterprise,
        country: this.tempCountry,
        marketingConsent: this.tempMarketingConsent,
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
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.showNotification(
        'Formato no soportado. Usa PNG, JPG, JPEG o WebP',
        'error',
      );
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showNotification('La imagen debe ser menor a 5MB', 'error');
      return;
    }

    // Almacenar archivo para subida con datos del perfil
    this.pendingImageFile = file;
    this.tempProfileImage = URL.createObjectURL(file); // Vista previa
    this.showNotification(
      'Imagen lista para subir. Guarda los cambios para subir.',
      'success',
    );

    // Guardar perfil automáticamente con nueva imagen
    this.saveUserInfo();
  }

  // Método para eliminar cuenta
  deleteAccount() {
    const dialogRef = this.modalService.openDeleteAccount({
      userName: this.fullName(),
      message:
        '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        console.log('Usuario confirmó la eliminación de cuenta');

        // Llamar al endpoint para programar la eliminación
        this.userService.deleteAccount().subscribe({
          next: (response) => {
            console.log('Cuenta programada para eliminación:', response);

            // Actualizar el perfil del usuario para incluir scheduledDeletionDate
            this.userService.getUserProfile().subscribe({
              next: (profile) => {
                this.userStore.setUser(profile);
              },
              error: (error) => {
                console.error('Error al actualizar perfil:', error);
              },
            });

            // Mostrar mensaje de éxito con la fecha programada
            const deletionDate = new Date(response.scheduledDeletionDate);
            const formattedDate = deletionDate.toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            this.modalService.openSuccess({
              title:
                this.t.accountDeletionScheduled ||
                'Cuenta programada para eliminación',
              message:
                this.t.accountDeletionScheduledMessage ||
                'Tu cuenta ha sido programada para eliminación en 10 días.',
              details: `${this.t.accountDeletionScheduledDetails || 'La eliminación se realizará el'} ${formattedDate}. ${this.t.accountDeletionRecoveryInfo || 'Tienes 10 días para recuperar tus datos si cambias de opinión.'}`,
            });
          },
          error: (error) => {
            console.error('Error al programar eliminación de cuenta:', error);

            let errorMessage =
              this.t.accountDeletionError ||
              'Error al programar la eliminación de cuenta';

            if (error?.error?.message) {
              errorMessage = error.error.message;
            } else if (error?.status === 401) {
              errorMessage =
                this.t.accountDeletionUnauthorized ||
                'No autorizado. Por favor, inicia sesión nuevamente.';
            } else if (error?.status === 404) {
              errorMessage =
                this.t.accountDeletionNotFound || 'Usuario no encontrado.';
            } else if (error?.status === 400) {
              errorMessage =
                this.t.accountDeletionBadRequest ||
                'Error al procesar la solicitud.';
            }

            this.modalService.openError({
              title: this.t.errorTitleDefault || 'Error',
              message: errorMessage,
            });
          },
        });
      } else if (result === 'support') {
        console.log('Usuario quiere contactar con soporte');
        // Aquí puedes agregar la lógica para contactar con soporte
        // Por ejemplo: abrir un enlace, mostrar información de contacto, etc.
        this.modalService.openSuccess({
          title: 'Contacto con soporte',
          message: 'Te hemos redirigido a nuestro equipo de soporte.',
          details: 'Nuestro equipo se pondrá en contacto contigo pronto.',
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

    // Dividir el nombre completo en name y lastname
    const fullNameParts = this.tempFullName.trim().split(/\s+/);
    let name = '';
    let lastname = '';

    if (fullNameParts.length > 0) {
      name = fullNameParts[0];
      if (fullNameParts.length > 1) {
        // Todo lo demás es el apellido
        lastname = fullNameParts.slice(1).join(' ');
      }
    }

    // Construir el objeto enterprise con los valores de los inputs
    const enterprise = {
      name: this.tempEnterprise.name || '',
      url: this.tempEnterprise.url || '',
    };

    // Actualizar perfil con country y marketingConsent (ahora permitidos)
    const updatedUserData = {
      name: name,
      lastname: lastname,
      profileImage: this.tempProfileImage,
      enterprise: enterprise,
      country: this.tempCountry,
      marketingConsent: this.tempMarketingConsent,
    };

    // Usar método unificado con posible archivo de imagen
    this.userService
      .updateUserProfile(updatedUserData, this.pendingImageFile)
      .subscribe({
        next: (response: any) => {
          this.userStore.setUser(response);
          this.showNotification(this.t.profileUpdated, 'success');
          this.pendingImageFile = undefined; // Limpiar archivo pendiente
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
      'Up to 3 team members',
    ],
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
    const percentage = Math.min(
      100,
      Math.max(0, ((this.selectedMinutes - 100) / (2000 - 100)) * 100),
    );

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

    const sliderContainer = (event.target as HTMLElement).closest(
      '.relative',
    ) as HTMLElement;

    const handleMouseMove = (e: Event) => {
      if (!this.isDragging || !sliderContainer) return;

      e.preventDefault();

      const mouseEvent = e as MouseEvent;
      const touchEvent = e as TouchEvent;
      const clientX = touchEvent.touches
        ? touchEvent.touches[0].clientX
        : mouseEvent.clientX;

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

  // Método para cargar las cuentas de Twilio del usuario
  loadTwilioAccounts() {
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        if (profile.twilio && Array.isArray(profile.twilio)) {
          this.twilioAccounts = profile.twilio.map((account) => ({
            twilioAccountId: account.twilioAccountId,
            twilioSid: account.twilioSid,
            twilioToken: account.twilioToken,
          }));
        } else {
          this.twilioAccounts = [];
        }
      },
      error: (error) => {
        console.error('Error al cargar cuentas de Twilio:', error);
        this.twilioAccounts = [];
      },
    });
  }

  // Método para editar una cuenta de Twilio existente
  editTwilioAccount(account: {
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  }) {
    this.showTwilioConfig = true;
    this.twilioAccountId = account.twilioAccountId;
    this.twilioSid = account.twilioSid;
    this.twilioToken = account.twilioToken;
  }

  // Método para crear una nueva cuenta de Twilio
  newTwilioAccount() {
    this.showTwilioConfig = true;
    this.twilioAccountId = undefined;
    this.twilioSid = '';
    this.twilioToken = '';
  }

  // Método para guardar la configuración de Twilio
  saveTwilioConfig() {
    // Validar que los campos no estén vacíos
    if (!this.twilioSid || !this.twilioToken) {
      this.showNotification('Por favor, completa todos los campos', 'error');
      return;
    }

    // Activar loader
    this.isLoadingTwilio = true;

    // Preparar los datos para enviar
    const config: {
      twilioSid: string;
      twilioToken: string;
      twilioAccountId?: number;
    } = {
      twilioSid: this.twilioSid.trim(),
      twilioToken: this.twilioToken.trim(),
    };

    // Si hay twilioAccountId, incluir para actualizar cuenta existente
    if (this.twilioAccountId !== undefined) {
      config.twilioAccountId = this.twilioAccountId;
    }

    // Realizar la petición POST
    this.twilioService.setConfig(config).subscribe({
      next: (response) => {
        this.isLoadingTwilio = false;
        this.showNotification(
          'Configuración de Twilio guardada correctamente',
          'success',
        );
        // Recargar las cuentas de Twilio
        this.loadTwilioAccounts();
        // Limpiar el formulario
        this.twilioAccountId = undefined;
        this.twilioSid = '';
        this.twilioToken = '';
        // Opcional: cerrar el formulario después de guardar
        // this.showTwilioConfig = false;
      },
      error: (error) => {
        this.isLoadingTwilio = false;
        // Mostrar mensaje de error del servidor o genérico
        const errorMessage =
          error?.error?.message ||
          error?.message ||
          'Error al guardar la configuración de Twilio';
        this.showNotification(errorMessage, 'error');
        console.error('Error al guardar configuración de Twilio:', error);
      },
    });
  }
}
