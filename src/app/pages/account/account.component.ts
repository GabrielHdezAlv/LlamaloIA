import {
  Component,
  inject,
  computed,
  OnInit,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserStorage } from '../../storages/user/user-storage';
import { UserService } from '../../core/services/user.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ModalService } from '../../shared/modals/modal.service';
import { NotificationService } from '../../core/services/notification.service';
import { I18nService } from '../../core/services/i18n.service';
import { RippleButtonComponent } from '../../shared/components/ripple-button/ripple-button.component';
import { AnimatedCheckboxComponent } from '../../shared/components/animated-checkbox/animated-checkbox.component';
import { ImageCropperComponent } from '../../shared/components/image-cropper/image-cropper.component';
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
    ImageCropperComponent,
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {
  // Enum para tipos de imagen
  private readonly ImageType = {
    NONE: 'none',
    DEFAULT: 'default',
    UPLOADED: 'uploaded',
    BLOB: 'blob',
  } as const;

  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private i18nService = inject(I18nService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private twilioService = inject(TwilioService);

  activeTab: 'profile' | 'security' | 'billing' | 'gifts' | 'connections' =
    'profile';
  showAvatarModal = false;
  showImageCropper = false;
  imageToCrop: string = '';

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
  private blobUrl: string | undefined;
  private imageTimestamp: number = Date.now();
  isImageLoading: boolean = false;
  imageLoadError: boolean = false;

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

  // Computed property para determinar si mostrar imagen
  shouldShowAvatar = computed(() => {
    const tempImage = this.tempProfileImage;
    const userImage = this.userProfileImage();

    // Solo mostrar si hay una imagen válida que no sea blob URL
    const hasValidTempImage = tempImage && !tempImage.startsWith('blob:');
    const hasValidUserImage = userImage && !userImage.startsWith('blob:');

    // Mostrar avatar si hay imagen válida y no hay error de carga
    return !!(hasValidTempImage || hasValidUserImage) && !this.imageLoadError;
  });
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
      // Limpiar URL de imagen de timestamps existentes para inicialización correcta
      const imageUrl = user.profileImage || '';
      // Solo usar URLs del servidor, nunca blob URLs
      if (imageUrl.startsWith('blob:')) {
        // Si por alguna razón hay una blob URL, limpiarla y usar la del usuario
        this.tempProfileImage = '';
        // Limpiar cualquier blob URL residual
        this.revokeBlobUrl();
      } else {
        this.tempProfileImage = imageUrl; // Mantener URL completa del servidor
        // Iniciar carga de la imagen si existe
        if (imageUrl && !imageUrl.startsWith('blob:')) {
          this.isImageLoading = true;
        }
      }

      // Cargar cuentas de Twilio si el usuario tiene
      if (user.twilio && Array.isArray(user.twilio)) {
        this.twilioAccounts = user.twilio.map((account) => ({
          twilioAccountId: account.twilioAccountId,
          twilioSid: account.twilioSid,
          twilioToken: account.twilioToken,
        }));
      }
    }

    // Verificar si hay parámetros de consulta para activar una pestaña específica
    this.route.queryParams.subscribe((params) => {
      if (params['tab'] === 'gifts') {
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
      this.notificationService.error('Por favor, completa ambos campos de contraseña');
      return;
    }

    // Validar longitud mínima de 8 caracteres
    if (this.newPassword.length < 8) {
      this.notificationService.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.newPassword !== this.confirmPassword) {
      this.notificationService.error(this.t.passwordsDoNotMatch || 'Las contraseñas no coinciden');
      return;
    }

    // Llamar al endpoint para cambiar la contraseña
    this.userService
      .changePassword(this.newPassword, this.confirmPassword)
      .subscribe({
        next: (response) => {
          // Mostrar modal de éxito
          this.notificationService.success('Contraseña actualizada correctamente');

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

          this.notificationService.error(errorMessage);
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

  // Métodos para manejar el image cropper
  openImageCropper(imageUrl: string) {
    this.imageToCrop = imageUrl;
    this.showImageCropper = true;
    this.showAvatarModal = false;
  }

  closeImageCropper() {
    this.showImageCropper = false;
    this.imageToCrop = '';
  }

  onImageCropped(croppedImageUrl: string) {
    // Convertir la URL del blob a un File
    fetch(croppedImageUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'profile-image.png', { type: 'image/png' });
        this.uploadProfileImage(file);
        this.closeImageCropper();
      })
      .catch(error => {
        console.error('Error al procesar la imagen recortada:', error);
        this.notificationService.error('Error al procesar la imagen');
      });
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
          this.notificationService.success('Avatar actualizado correctamente');
        },
        error: (error: any) => {
          this.notificationService.error('Error al actualizar el avatar');
        },
      });
    }
  }

  getUserProfileImage = () => {
    const user = this.userStore.user();
    return user?.profileImage || 'assets/predeterminada.webp';
  };

  onUploadPhotoClick() {
    // Crear input file oculto
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Validar tipo de archivo
        const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          this.notificationService.error(
            'Formato no soportado. Usa PNG, JPG, JPEG o WebP'
          );
          return;
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.notificationService.error('La imagen debe ser menor a 5MB');
          return;
        }

        // Crear URL temporal para el image cropper
        const tempUrl = URL.createObjectURL(file);
        this.openImageCropper(tempUrl);
      }
    };
    input.click();
  }

  uploadProfileImage(file: File) {
    // Validar tipo de archivo
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.notificationService.error(
        'Formato no soportado. Usa PNG, JPG, JPEG o WebP'
      );
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.notificationService.error('La imagen debe ser menor a 5MB');
      return;
    }

    // Liberar blob URL anterior para evitar fugas de memoria
    this.revokeBlobUrl();

    // NO asignar blob URL a tempProfileImage para evitar errores de seguridad
    // En su lugar, mantener tempProfileImage vacío y solo usar el archivo pendiente
    this.tempProfileImage = '';
    this.blobUrl = URL.createObjectURL(file);

    // Almacenar archivo para subida con datos del perfil
    this.pendingImageFile = file;

    this.notificationService.success(
      'Imagen lista para subir. Guarda los cambios para subir.'
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
        // Llamar al endpoint para programar la eliminación
        this.userService.deleteAccount().subscribe({
          next: (response) => {
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

            this.notificationService.success('Cuenta programada para eliminación en 10 días.');
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

            this.notificationService.error(errorMessage);
          },
        });
      } else if (result === 'support') {
        // Aquí puedes agregar la lógica para contactar con soporte
        // Por ejemplo: abrir un enlace, mostrar información de contacto, etc.
        this.notificationService.success('Te hemos redirigido a nuestro equipo de soporte.');
      } else {
        console.info('Usuario canceló la eliminación');
      }
    });
  }

  // Método para obtener URL de imagen con cache-busting
  getImageUrl(): string {
    const tempImage = this.tempProfileImage;
    const userImage = this.userProfileImage();

    // Si hay un archivo pendiente con blob URL, mostrar la vista previa
    if (this.pendingImageFile && this.blobUrl) {
      return this.blobUrl; // Mostrar vista previa temporal
    }

    // Priorizar imagen del usuario sobre blob URLs
    if (userImage && !userImage.startsWith('blob:')) {
      // Usar imagen del usuario si existe y no es blob URL
      if (userImage.includes('?t=')) {
        return userImage; // Ya tiene timestamp
      }
      const separator = userImage.includes('?') ? '&' : '?';
      return `${userImage}${separator}t=${this.imageTimestamp}`;
    }

    // Si no hay imagen de usuario, usar tempImage (solo si no es blob URL)
    if (tempImage && !tempImage.startsWith('blob:')) {
      if (tempImage.startsWith('http')) {
        if (tempImage.includes('?t=')) {
          return tempImage; // Ya tiene timestamp
        }
        const separator = tempImage.includes('?') ? '&' : '?';
        return `${tempImage}${separator}t=${this.imageTimestamp}`;
      }
      return tempImage; // URL relativa (avatar por defecto)
    }

    // Si todo falla, no devolver nada
    return '';
  }

  // Método para iniciar la carga de imagen
  onImageLoadStart(): void {
    this.isImageLoading = true;
    this.imageLoadError = false;
  }

  // Método llamado cuando la imagen se carga correctamente
  onImageLoad(): void {
    this.isImageLoading = false;
    this.imageLoadError = false;
  }

  // Método llamado cuando la imagen falla al cargar
  onImageError(): void {
    this.isImageLoading = false;
    this.imageLoadError = true;
  }

  // Método para limpiar blob URL
  private revokeBlobUrl(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = undefined;
    }
  }

  ngOnDestroy(): void {
    // Limpiar blob URL al destruir componente para evitar fugas de memoria
    this.revokeBlobUrl();
  }

  // Método para canjear recompensa
  redeemReward(rewardType: string) {
    // Aquí puedes implementar la lógica para canjear la recompensa
    this.notificationService.success(this.t.giftRedeemedSuccess);
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
          this.notificationService.success(this.t.profileUpdated);
          this.pendingImageFile = undefined; // Limpiar archivo pendiente

          // Limpiar blob URL y actualizar timestamp para nueva imagen
          if (this.blobUrl) {
            this.revokeBlobUrl();
            this.imageTimestamp = Date.now(); // Nuevo timestamp para evitar caché
          }
        },
        error: (error: any) => {
          this.notificationService.error(this.t.errorUpdatingProfile);
        },
      });
  }

  navigateToUpgradePlan() {
    this.router.navigate(['/dashboard/billing']);
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
      this.notificationService.error('Por favor, completa todos los campos');
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
        this.notificationService.success(
          'Configuración de Twilio guardada correctamente'
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
        this.notificationService.error(errorMessage);
        console.error('Error al guardar configuración de Twilio:', error);
      },
    });
  }
}
