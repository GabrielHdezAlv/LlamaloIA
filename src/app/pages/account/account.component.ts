import { firstValueFrom } from 'rxjs';
import {
  Component,
  inject,
  computed,
  OnInit,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
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
import { StripeService } from '../../core/services/stripe.service';
import { ShopifyIntegrationService } from '../../core/services/shopify-integration.service';

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
  animations: [
    trigger('sectionEnter', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('220ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
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
  private stripeService = inject(StripeService);
  private shopifyIntegrationService = inject(ShopifyIntegrationService);

  activeTab:
    | 'profile'
    | 'security'
    | 'billing'
    | 'gifts'
    | 'connections' = 'profile';
  /** Sección realmente mostrada (va por detrás de activeTab para animar salida → entrada) */
  displayedTab:
    | 'profile'
    | 'security'
    | 'billing'
    | 'gifts'
    | 'connections' = 'profile';
  sectionLeaving = false;
  private sectionTransitionTimeout: ReturnType<typeof setTimeout> | null = null;
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
  isSaving = false;
  currentPlanName: string = 'Gratis';
  stripeBillingRedirecting = false;

  // Integraciones (mismo patrón visual que edit-agent / connect-phone-step)
  twilioConnectionsExpanded = false;
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
  /** Cuenta elegida para conectar / validar teléfono (mismo flujo que connect-phone-step). */
  selectedTwilioAccount: {
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  } | null = null;
  phoneNumber = '';
  selectedCountryCode = '+34';
  availablePhoneNumbers: Array<{
    phoneId: number;
    countryCode: string;
    number: string;
    state?: 'Activo' | 'Inactivo';
    importedBy?: string;
    twilioAccountId?: number;
  }> = [];
  loadingPhoneNumbers = false;
  phoneValidationStatus: 'success' | 'error' | null = null;
  phoneErrorMessage = '';
  isValidatingPhone = false;
  private phoneValidationTimeout: ReturnType<typeof setTimeout> | null = null;

  /** Make: panel lateral (mismo flujo que paso Instrucciones al crear agente). */
  showMakeConfig = false;
  isMakeConfigClosing = false;
  makeActionData = { name: '', description: '', serverUrl: '' };
  makeActionActive = false;
  makeGeneratedWebhook = '';
  private readonly makeSidebarCloseMs = 280;

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

  /** Primera tienda Shopify conectada del perfil (misma idea que conexiones en edit-agent). */
  primaryShopifyDomain = computed(() => {
    const shops = this.user()?.integrations?.shopify ?? [];
    if (!shops.length) return '';
    const first = shops.find((s) => s.connected && s.shopDomain);
    return first?.shopDomain ?? '';
  });

  /** Tiendas Shopify enlazadas al perfil (panel borrar / desvincular). */
  connectedShopifyStores = computed(() => {
    const shops = this.user()?.integrations?.shopify ?? [];
    return shops.filter(
      (s) => !!(s?.shopDomain?.trim()) && s.connected !== false,
    );
  });

  /** Subtítulo bajo “Shopify”, al estilo Twilio. */
  shopifyConnectionsSubtitleText = computed(() => {
    const shops = this.connectedShopifyStores();
    const n = shops.length;
    if (n === 0) return '';
    const tr = this.i18nService.getTranslations();
    if (n === 1) return shops[0].shopDomain!.trim();
    return `${n} ${tr.shopifyConnectedSummaryManySuffix}`;
  });

  /** Panel desplegable para listar y borrar tiendas (como Twilio). */
  shopifyConnectionsExpanded = false;
  deletingShopifyDomain: string | null = null;

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

  /** Texto bajo "Twilio" cuando hay cuentas (sin guión; singular / plural). */
  get twilioConnectionsSubtitle(): string {
    const n = this.twilioAccounts.length;
    if (n <= 0) return '';
    const tr = this.t;
    return n === 1
      ? tr.twilioConnectedSummaryOne
      : `${n} ${tr.twilioConnectedSummaryManySuffix}`;
  }

  /** Cerrar si el panel está abierto; Abrir si hay cuentas y está cerrado; Conectar si no hay cuentas. */
  get twilioHeaderActionLabel(): string {
    if (this.twilioConnectionsExpanded) return this.t.closeBtn;
    if (this.twilioAccounts.length > 0) return this.t.openBtn;
    return this.t.connect;
  }

  // Método para cambiar de pestaña (primero desaparece el contenido, luego aparece el nuevo)
  setActiveTab(
    tab:
      | 'profile'
      | 'security'
      | 'billing'
      | 'gifts'
      | 'connections',
  ) {
    if (tab === this.displayedTab) return;
    if (this.sectionTransitionTimeout) clearTimeout(this.sectionTransitionTimeout);
    this.activeTab = tab;
    if (tab === 'connections') {
      this.loadTwilioAccounts();
      void this.userStore.loadUserProfile();
    }
    this.sectionLeaving = true;
    this.sectionTransitionTimeout = setTimeout(() => {
      this.displayedTab = tab;
      this.sectionLeaving = false;
      this.sectionTransitionTimeout = null;
    }, 200);
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

  /** Cupo mensual (UTC), alineado con el backend (`minute-quota` / Firestore). */
  minuteQuotaView = computed(() => {
    const u = this.user();
    if (!u) return null;
    const month = new Date().toISOString().slice(0, 7);
    const usedRaw = u.minutesByMonth?.[month];
    const used =
      typeof usedRaw === 'number' && !Number.isNaN(usedRaw) ? usedRaw : 0;
    const planLimit = u.minutesLimit ?? 100;
    const extra = u.extraMinutes ?? 0;
    const plan = (u.plan ?? '').toLowerCase();
    if (plan === 'premium') {
      return { mode: 'unlimited' as const, used };
    }
    const total = planLimit + extra;
    const remaining = Math.max(0, total - used);
    return {
      mode: 'limited' as const,
      used,
      total,
      remaining,
      planLimit,
      extra,
    };
  });

  showOutOfMinutesBanner = computed(() => {
    const q = this.minuteQuotaView();
    if (!q || q.mode === 'unlimited') return false;
    return q.remaining <= 0;
  });

  /** Días restantes de prueba (plan gratis con trial activo). */
  trialDaysRemaining = computed(() => {
    const u = this.user();
    const pu = u?.planUsage;
    if (!u || u.plan !== 'gratis' || !pu?.trialActive) return null;
    const raw = pu.trialEndsAt ?? u.trialEndsAt;
    if (!raw) return null;
    const end = new Date(raw).getTime();
    const days = Math.ceil((end - Date.now()) / 86400000);
    return Math.max(0, days);
  });

  /** Resumen de uso vs límites (API planUsage). */
  planUsageSummary = computed(() => {
    const pu = this.user()?.planUsage;
    if (!pu) return null;
    const mbUsed = (pu.storageUsedBytes / (1024 * 1024)).toFixed(1);
    return `${pu.agentsCount}/${pu.limits.agents} ${this.t.agentsShort} · ${pu.webSourcesCount}/${pu.limits.indexedUrls} URLs · ${pu.docSourcesCount}/${pu.limits.documentsMax} ${this.t.docsShort} · ${mbUsed} / ${pu.limits.storageTotalMb} MB`;
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

      this.syncBillingFromUser();

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
      if (params['tab'] === 'billing') {
        this.activeTab = 'billing';
        this.displayedTab = 'billing';
        this.sectionLeaving = false;
      }

      if (params['stripe'] === 'success' || params['stripe'] === 'return') {
        void this.userStore.loadUserProfile().then(() => {
          this.syncBillingFromUser();
          this.notificationService.success(this.t.stripeBillingUpdated);
        });
        setTimeout(() => {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { stripe: null },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }, 10);
      }

      if (params['tab'] === 'gifts') {
        // Ir directamente a la pestaña de regalos SIN animación
        this.activeTab = 'gifts';
        this.displayedTab = 'gifts';
        this.sectionLeaving = false;

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
    const dialogRef = this.modalService.openWarning({
      title: '',
      message: `¿Seguro que quieres eliminar tu cuenta "${this.fullName()}"?`,
      confirmText: 'Sí, eliminar cuenta',
      cancelText: 'Cancelar',
      showCancelButton: true,
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
    if (this.sectionTransitionTimeout) clearTimeout(this.sectionTransitionTimeout);
    if (this.phoneValidationTimeout) clearTimeout(this.phoneValidationTimeout);
    this.revokeBlobUrl();
  }

  private readonly gift2SocialUrls: Record<
    'instagram' | 'linkedin' | 'x',
    string
  > = {
    instagram: 'https://www.instagram.com/llamaloai/',
    linkedin:
      'https://www.linkedin.com/company/llamaloai/posts/?feedView=all',
    x: 'https://x.com/llamaloai',
  };

  openSocialGiftNetwork(network: 'instagram' | 'linkedin' | 'x') {
    const url = this.gift2SocialUrls[network];
    if (!url || !isPlatformBrowser(this.platformId)) return;
    
    // Primero abrimos la URL en nueva pestaña
    window.open(url, '_blank', 'noopener,noreferrer');
    
    // Y llamamos automáticamente a canjear para esa red
    this.redeemReward(network);
  }

  isRewardRedeemed(rewardType: string): boolean {
    const redeemed = this.user()?.redeemedRewards || [];
    return redeemed.includes(rewardType);
  }

  // Método para canjear recompensa
  redeemReward(rewardType: string) {
    this.userService.redeemReward(rewardType).subscribe({
      next: (res: any) => {
        // Actualizamos los datos del usuario en el store para reflejar los minutos extra ganados
        this.userService.getUserProfile().subscribe((profile) => {
          this.userStore.setUser(profile);
        });
        
        this.notificationService.success(res.message || this.t.giftRedeemedSuccess);
      },
      error: (err: any) => {
        const errorMessage = err?.error?.message || 'Error al canjear la recompensa';
        this.notificationService.error(errorMessage);
      }
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
    this.modalService.openUpgradePlan();
  }

  private syncBillingFromUser(): void {
    const u = this.user();
    if (!u) return;
    this.currentPlanMinutes = u.minutesLimit ?? 100;
    const planMap: Record<string, string> = {
      gratis: 'Gratis',
      basic: 'Gratis',
      free: 'Gratis',
      starter: 'Starter',
      growth: 'Growth',
      scale: 'Scale',
      pro: 'Pro',
      premium: 'Premium',
    };
    this.currentPlanName = u.plan ? planMap[u.plan] || 'Gratis' : 'Gratis';
  }

  openBillingPortal(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const u = this.user();
    if (!u?.stripeCustomerId?.trim()) {
      this.notificationService.error(this.t.stripeNoCustomerYet);
      return;
    }
    const returnUrl = `${window.location.origin}/dashboard/account?tab=billing&stripe=return`;
    this.stripeBillingRedirecting = true;
    this.stripeService.createBillingPortalSession({ returnUrl }).subscribe({
      next: ({ url }) => {
        if (url) {
          window.location.href = url;
          return;
        }
        this.notificationService.error(this.t.stripeBillingError);
        this.stripeBillingRedirecting = false;
      },
      error: () => {
        this.notificationService.error(this.t.stripeBillingError);
        this.stripeBillingRedirecting = false;
      },
    });
  }

  toggleTwilioConnectionsPanel(): void {
    const next = !this.twilioConnectionsExpanded;
    this.twilioConnectionsExpanded = next;
    if (!next) {
      this.showTwilioConfig = false;
      this.clearTwilioPhoneUi();
      return;
    }
    // Mismo flujo que connect-phone-step: sin cuentas, abrir directo el formulario
    if (this.twilioAccounts.length === 0) {
      this.twilioAccountId = undefined;
      this.twilioSid = '';
      this.twilioToken = '';
      this.showTwilioConfig = true;
    }
  }

  private clearTwilioPhoneUi(): void {
    this.selectedTwilioAccount = null;
    this.resetTwilioPhoneFields();
    this.availablePhoneNumbers = [];
    this.loadingPhoneNumbers = false;
  }

  private resetTwilioPhoneFields(): void {
    if (this.phoneValidationTimeout) {
      clearTimeout(this.phoneValidationTimeout);
      this.phoneValidationTimeout = null;
    }
    this.phoneNumber = '';
    this.selectedCountryCode = '+34';
    this.phoneValidationStatus = null;
    this.phoneErrorMessage = '';
    this.isValidatingPhone = false;
  }

  onTwilioHeaderButtonClick(event: Event): void {
    event.stopPropagation();
    this.toggleTwilioConnectionsPanel();
  }

  goToShopifyOnboardingFromAccount(): void {
    this.router.navigate(['/shopify-onboarding'], {
      queryParams: { source: 'account' },
    });
  }

  get shopifyDeleteHeaderLabel(): string {
    if (this.shopifyConnectionsExpanded) return this.t.closeBtn;
    return this.t.shopifyManageConnectionBtn;
  }

  toggleShopifyConnectionsPanel(): void {
    if (this.connectedShopifyStores().length === 0) return;
    this.shopifyConnectionsExpanded = !this.shopifyConnectionsExpanded;
  }

  onShopifyDeleteHeaderButtonClick(event: Event): void {
    event.stopPropagation();
    this.toggleShopifyConnectionsPanel();
  }

  deleteShopifyStore(shopDomain: string): void {
    const tr = this.t;
    const dialogRef = this.modalService.openWarning({
      title: tr.shopifyDisconnectConfirmTitle,
      message: tr.shopifyDisconnectConfirmMessage.replace(
        '{{shop}}',
        shopDomain,
      ),
      confirmText: tr.shopifyDisconnectConfirmAction,
      cancelText: tr.cancelBtn,
      showCancelButton: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== true) return;
      this.deletingShopifyDomain = shopDomain;
      this.shopifyIntegrationService.disconnectStore(shopDomain).subscribe({
        next: async (res: { message?: string }) => {
          this.deletingShopifyDomain = null;
          this.notificationService.success(
            res.message ?? tr.shopifyDisconnectedSuccess,
          );
          await this.userStore.loadUserProfile();
          if (this.connectedShopifyStores().length === 0) {
            this.shopifyConnectionsExpanded = false;
          }
        },
        error: (err: { error?: { message?: string } }) => {
          this.deletingShopifyDomain = null;
          this.notificationService.error(
            err?.error?.message ?? tr.shopifyDisconnectError,
          );
        },
      });
    });
  }

  toggleMakeConfig(): void {
    if (this.showMakeConfig) {
      this.isMakeConfigClosing = true;
      setTimeout(() => {
        this.showMakeConfig = false;
        this.isMakeConfigClosing = false;
      }, this.makeSidebarCloseMs);
    } else {
      this.showMakeConfig = true;
      this.isMakeConfigClosing = false;
    }
  }

  onMakeActionNameInput(value: string): void {
    this.makeActionData = { ...this.makeActionData, name: value };
  }

  onMakeActionDescriptionInput(value: string): void {
    this.makeActionData = { ...this.makeActionData, description: value };
  }

  onMakeActionServerUrlInput(value: string): void {
    this.makeActionData = { ...this.makeActionData, serverUrl: value };
  }

  onSaveMakeAction(): void {
    const { name, serverUrl } = this.makeActionData;
    if (!name.trim() || !serverUrl.trim()) {
      return;
    }
    if (!this.makeGeneratedWebhook) {
      this.makeGeneratedWebhook = this.generateMockMakeWebhook();
    }
    this.makeActionActive = true;
    this.isMakeConfigClosing = true;
    setTimeout(() => {
      this.showMakeConfig = false;
      this.isMakeConfigClosing = false;
    }, this.makeSidebarCloseMs);
  }

  private generateMockMakeWebhook(): string {
    const token =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID().replace(/-/g, '').slice(0, 32)
        : Math.random().toString(36).slice(2) +
          Math.random().toString(36).slice(2);
    return `https://hooks.llamalo.ai/make/${token}`;
  }

  onEditMakeAction(): void {
    this.showMakeConfig = true;
    this.isMakeConfigClosing = false;
  }

  onDeleteMakeAction(): void {
    const actionLabel = this.makeActionData.name?.trim() || 'esta acción';
    const dialogRef = this.modalService.openWarning({
      title: '',
      message: `¿Seguro que quieres eliminar la acción de Make "${actionLabel}"?`,
      confirmText: 'Sí, eliminar acción',
      cancelText: 'Cancelar',
      showCancelButton: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.makeActionActive = false;
        this.makeGeneratedWebhook = '';
        this.makeActionData = { name: '', description: '', serverUrl: '' };
      }
    });
  }

  async copyMakeWebhook(): Promise<void> {
    const url = this.makeGeneratedWebhook?.trim();
    if (
      !url ||
      typeof navigator === 'undefined' ||
      !navigator.clipboard?.writeText
    ) {
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
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
        if (
          this.twilioAccounts.length === 0 &&
          this.twilioConnectionsExpanded
        ) {
          this.showTwilioConfig = true;
          this.twilioAccountId = undefined;
          this.twilioSid = '';
          this.twilioToken = '';
        }
        if (
          this.selectedTwilioAccount &&
          !this.twilioAccounts.some(
            (a) =>
              a.twilioAccountId === this.selectedTwilioAccount!.twilioAccountId,
          )
        ) {
          this.clearTwilioPhoneUi();
        }
      },
      error: (error) => {
        console.error('Error al cargar cuentas de Twilio:', error);
        this.twilioAccounts = [];
      },
    });
  }

  selectTwilioForPhone(account: {
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  }): void {
    this.twilioConnectionsExpanded = true;
    this.showTwilioConfig = false;
    this.twilioAccountId = undefined;
    this.selectedTwilioAccount = account;
    this.resetTwilioPhoneFields();
    this.loadAvailablePhoneNumbers();
  }

  backTwilioPhoneSelection(): void {
    this.selectedTwilioAccount = null;
    this.resetTwilioPhoneFields();
    this.availablePhoneNumbers = [];
  }

  loadAvailablePhoneNumbers(): void {
    if (!this.selectedTwilioAccount) {
      this.availablePhoneNumbers = [];
      return;
    }
    this.loadingPhoneNumbers = true;
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        this.loadingPhoneNumbers = false;
        const allPhoneNumbers = profile.phoneNumbers || [];
        const agentPhoneNumbers = new Set<string>();
        if (profile.agents && Array.isArray(profile.agents)) {
          profile.agents.forEach((agent) => {
            if (agent.phoneNumbers) {
              agentPhoneNumbers.add(
                `${agent.phoneNumbers.countryCode}${agent.phoneNumbers.number}`,
              );
            }
          });
        }
        this.availablePhoneNumbers = allPhoneNumbers.filter((phone) => {
          const belongsToAccount =
            phone.twilioAccountId ===
            this.selectedTwilioAccount!.twilioAccountId;
          const phoneKey = `${phone.countryCode}${phone.number}`;
          return belongsToAccount && !agentPhoneNumbers.has(phoneKey);
        });
      },
      error: (err) => {
        this.loadingPhoneNumbers = false;
        console.error('Error al cargar números de teléfono:', err);
        this.availablePhoneNumbers = [];
      },
    });
  }

  onAccountPhoneNumberChange(): void {
    if (this.phoneValidationTimeout) {
      clearTimeout(this.phoneValidationTimeout);
    }
    if (!this.phoneNumber || !this.phoneNumber.trim()) {
      this.phoneValidationStatus = null;
      this.phoneErrorMessage = '';
      this.isValidatingPhone = false;
      return;
    }
    if (!this.selectedTwilioAccount) {
      this.phoneValidationStatus = null;
      return;
    }
    this.phoneValidationTimeout = setTimeout(() => {
      this.validateAccountPhoneNumber();
    }, 500);
  }

  onAccountPhoneNumberSelected(phone: {
    countryCode: string;
    number: string;
  }): void {
    this.phoneNumber = phone.number;
    this.selectedCountryCode = phone.countryCode.startsWith('+')
      ? phone.countryCode
      : '+' + phone.countryCode;
    this.validateAccountPhoneNumber();
  }

  validateAccountPhoneNumber(): void {
    if (!this.phoneNumber || !this.phoneNumber.trim() || !this.selectedTwilioAccount) {
      return;
    }
    const countryCode = this.selectedCountryCode || '+34';
    const number = this.phoneNumber.trim();
    this.phoneValidationStatus = null;
    this.phoneErrorMessage = '';
    this.isValidatingPhone = true;
    const twilioAccountId = this.selectedTwilioAccount.twilioAccountId;
    this.twilioService
      .validatePhone(countryCode, number, twilioAccountId)
      .subscribe({
        next: () => {
          this.isValidatingPhone = false;
          this.phoneValidationStatus = 'success';
        },
        error: (error) => {
          this.isValidatingPhone = false;
          this.phoneValidationStatus = 'error';
          let errorMessage =
            'Error al validar el número de teléfono. Por favor, intenta nuevamente.';
          if (error.status === 400) {
            errorMessage =
              error?.error?.message ||
              'Número no disponible. Por favor, verifica que el número sea correcto y esté disponible en Twilio.';
          } else if (error.status === 401) {
            errorMessage =
              'Token inválido o expirado. Por favor, inicia sesión nuevamente.';
          } else if (error.status === 404) {
            errorMessage =
              'Usuario no encontrado o configuración de Twilio no encontrada. Por favor, verifica tu configuración.';
          } else if (error?.error?.message) {
            errorMessage = error.error.message;
          }
          this.phoneErrorMessage = errorMessage;
          console.error('Error al validar número:', error);
        },
      });
  }

  // Método para editar una cuenta de Twilio existente
  editTwilioAccount(account: {
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  }) {
    this.twilioConnectionsExpanded = true;
    this.showTwilioConfig = true;
    this.selectedTwilioAccount = null;
    this.resetTwilioPhoneFields();
    this.availablePhoneNumbers = [];
    this.twilioAccountId = account.twilioAccountId;
    this.twilioSid = account.twilioSid;
    this.twilioToken = account.twilioToken;
  }

  // Método para crear una nueva cuenta de Twilio
  newTwilioAccount() {
    this.twilioConnectionsExpanded = true;
    this.showTwilioConfig = true;
    this.selectedTwilioAccount = null;
    this.resetTwilioPhoneFields();
    this.availablePhoneNumbers = [];
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
        this.showTwilioConfig = false;
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

  deleteTwilioAccount(twilioAccountId: number) {
    const dialogRef = this.modalService.openWarning({
      title: 'Eliminar cuenta de Twilio',
      message:
        '¿Estás seguro de que quieres eliminar esta cuenta de Twilio? Al hacerlo, no podrás importar más números de esta cuenta.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      showCancelButton: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.isLoadingTwilio = true;
        this.twilioService.deleteTwilioAccount(twilioAccountId).subscribe({
          next: (res) => {
            this.isLoadingTwilio = false;
            this.notificationService.success(
              res.message || 'Cuenta de Twilio eliminada correctamente.'
            );
            this.loadTwilioAccounts();
          },
          error: (err) => {
            this.isLoadingTwilio = false;
            this.notificationService.error(
              err?.error?.message || 'Error al eliminar la cuenta de Twilio.'
            );
          },
        });
      }
    });
  }

  async changePlan(planType: string) {
    this.isSaving = true;
    try {
      await firstValueFrom(this.userService.changePlan(planType));
      await this.userStore.loadUserProfile();
      this.notificationService.success('Plan actualizado correctamente');
    } catch (error: unknown) {
      console.error('Error changing plan:', error);
      const httpErr = error as { error?: { message?: string } };
      const msg =
        httpErr?.error?.message ||
        'Error al actualizar el plan (en producción el cambio manual puede estar desactivado).';
      this.notificationService.error(msg);
    } finally {
      this.isSaving = false;
    }
  }
}
