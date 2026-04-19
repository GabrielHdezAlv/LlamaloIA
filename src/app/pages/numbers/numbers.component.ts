import {
  Component,
  computed,
  inject,
  OnInit,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { Subject, timer } from 'rxjs';
import { debounce, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { I18nService } from '../../core/services/i18n.service';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';
import { RippleButtonComponent } from '../../shared/components/ripple-button/ripple-button.component';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ModalService } from '../../shared/modals/modal.service';
import { UserService } from '../../core/services/user.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { TwilioService } from '../../core/services/twilio.service';
import { getApiErrorMessage } from '../../core/utils/api-error-message';
import { getGroupedCountryDialOptions } from './phone-country-dial-codes';

interface PhoneNumberDisplay {
  phoneId: number;
  countryCode: string;
  number: string;
  label?: string;
  state: 'Activo' | 'Inactivo';
  importedBy: string;
}

@Component({
  selector: 'app-numbers',
  imports: [
    RippleButtonComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './numbers.component.html',
  styleUrl: './numbers.component.scss',
})
export class NumbersComponent implements OnInit, AfterViewInit {
  private i18nService = inject(I18nService);
  router = inject(Router);
  private modalService = inject(ModalService);
  private userService = inject(UserService);
  private twilioService = inject(TwilioService);
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  private cdr: ChangeDetectorRef;

  // Variable para controlar la animación de fade in
  showContent: boolean = false;

  // Lista de números de teléfono para mostrar en la tabla
  phoneNumbers: PhoneNumberDisplay[] = [];
  openMenuIndex: number | null = null;

  // Búsqueda de números
  searchTerm: string = '';

  // Importar número: sidebar Twilio
  showImportSidebar = false;
  importSidebarClosing = false;
  importForm: FormGroup;
  isImportLoading = false;
  showCountryMenu = false;
  selectedCountryCode = '+34';
  selectedCountry = 'es';
  /** Prefijos: top 10 + resto A–Z, según idioma UI */
  readonly countryDialGrouped = computed(() => {
    const code = this.i18nService.selectedLanguage().code;
    return getGroupedCountryDialOptions(code === 'en' ? 'en' : 'es');
  });
  routingRegionEnabled = false;

  private isBrowser: boolean;
  private userTwilioSid: string | null = null;
  private userTwilioToken: string | null = null;
  importErrorMessage: string | null = null;

  private searchSubject = new Subject<string>();

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    cdr: ChangeDetectorRef,
  ) {
    this.i18nService.initializeLanguage();
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.cdr = cdr;
    this.importForm = this.fb.group({
      phoneNumber: ['', Validators.required],
      twilioSid: [''],
      twilioToken: [''],
      label: [''], // Etiqueta opcional para el número importado
    });

    // Limpiar errores de servidor al modificar cualquier campo del formulario
    this.importForm.valueChanges.subscribe(() => {
      if (this.importErrorMessage) {
        this.importErrorMessage = null;
      }
      this.importForm.get('phoneNumber')?.setErrors(null);
      this.importForm.get('twilioSid')?.setErrors(null);
      this.importForm.get('twilioToken')?.setErrors(null);
    });
  }

  // Exponer userTwilioSid para el HTML
  get isTwilioImportEnabled(): boolean {
    return !!this.userTwilioSid;
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounce((value: string) => {
          const t = value?.trim() ?? '';
          return t.length === 0 ? timer(0) : timer(200);
        }),
        distinctUntilChanged(),
        switchMap((term) =>
          this.userService.getUserPhoneNumbers(
            term?.trim() ? term.trim() : undefined,
          ),
        ),
      )
      .subscribe({
        next: (response) => {
          const phones = response?.phoneNumbers || [];

          if (phones.length > 0) {
            this.phoneNumbers = phones.map((phone, index) => ({
              phoneId: phone.phoneId || index + 1,
              countryCode: phone.countryCode || '',
              number: String(phone.number || ''),
              label: `ID ${phone.phoneId || index + 1}`,
              state: phone.state || 'Activo',
              importedBy: phone.importedBy || 'Twilio',
            }));
          } else {
            this.phoneNumbers = [];
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          if (this.isBrowser && error?.status !== 401) {
            console.error(
              'Error al obtener los números de teléfono del usuario:',
              error,
            );
          }
          this.phoneNumbers = [];
          this.cdr.detectChanges();
        },
      });

    if (this.isBrowser) {
      this.searchSubject.next('');
    }
  }

  /** Recarga números respetando el término de búsqueda (tras importar o eliminar). */
  private loadPhoneNumbers(q?: string): void {
    this.userService.getUserPhoneNumbers(q).subscribe({
      next: (response) => {
        const phones = response?.phoneNumbers || [];

        if (phones.length > 0) {
          this.phoneNumbers = phones.map((phone, index) => ({
            phoneId: phone.phoneId || index + 1,
            countryCode: phone.countryCode || '',
            number: String(phone.number || ''),
            label: `ID ${phone.phoneId || index + 1}`,
            state: phone.state || 'Activo',
            importedBy: phone.importedBy || 'Twilio',
          }));
          this.cdr.detectChanges();
        } else {
          this.phoneNumbers = [];
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        if (this.isBrowser && error?.status !== 401) {
          console.error(
            'Error al obtener los números de teléfono del usuario:',
            error,
          );
        }
        this.phoneNumbers = [];
        this.cdr.detectChanges();
      },
    });
  }

  ngAfterViewInit(): void {
    // Ejecutar animación después de que la vista esté completamente inicializada
    this.startFadeInAnimation();
  }

  private startFadeInAnimation(): void {
    // Verificar si estamos en el navegador de manera más robusta
    const isInBrowser = typeof window !== 'undefined' && window.localStorage;

    if (!isInBrowser) {
      this.showContent = true;
      this.cdr.detectChanges();
      return;
    }

    // Contenido aparece después de un momento (como en inicio)
    setTimeout(() => {
      this.showContent = true;
      this.cdr.detectChanges();
    }, 180);
  }

  // Actualizar lista al escribir (sin necesidad de Enter)
  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm ?? '');
  }

  openImportFromTwilio(): void {
    this.importErrorMessage = null;

    // Intentar obtener credenciales de Twilio del perfil si existen
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        // Si tiene cuentas de Twilio configuradas, usar la primera
        if (
          profile.twilio &&
          Array.isArray(profile.twilio) &&
          profile.twilio.length > 0 &&
          profile.twilio[0]?.twilioSid &&
          profile.twilio[0]?.twilioToken
        ) {
          this.userTwilioSid = profile.twilio[0].twilioSid;
          this.userTwilioToken = profile.twilio[0].twilioToken;
        } else {
          // Si no hay configuración, limpiar las credenciales
          this.userTwilioSid = null;
          this.userTwilioToken = null;
        }
      },
      error: () => {
        // En caso de error, continuar sin credenciales
        this.userTwilioSid = null;
        this.userTwilioToken = null;
      },
    });

    // Abrir el sidebar de importación
    this.showImportSidebar = true;
    // Limpiar solo el número y etiqueta
    this.importForm.reset({ phoneNumber: '' });
    this.selectedCountryCode = '+34';
    this.selectedCountry = 'es';
    this.routingRegionEnabled = false;
  }

  closeImportSidebar(): void {
    if (this.importSidebarClosing) return;
    this.importSidebarClosing = true;
    this.showCountryMenu = false;
    setTimeout(() => {
      this.showImportSidebar = false;
      this.importSidebarClosing = false;
    }, 280);
  }

  toggleCountryMenu(): void {
    this.showCountryMenu = !this.showCountryMenu;
  }

  selectCountry(code: string, dial: string): void {
    this.selectedCountryCode = dial;
    this.selectedCountry = code;
    this.showCountryMenu = false;

    // Si había un error de importación y el usuario cambia el prefijo,
    // limpiamos errores para permitir un nuevo intento sin tocar los inputs.
    if (this.importErrorMessage) {
      this.importErrorMessage = null;
    }
    this.importForm.get('phoneNumber')?.setErrors(null);
    this.importForm.get('twilioSid')?.setErrors(null);
    this.importForm.get('twilioToken')?.setErrors(null);
    this.importForm.updateValueAndValidity({ emitEvent: false });
  }

  onImportSubmit(): void {
    if (!this.importForm.valid) return;
    this.importErrorMessage = null;
    const phoneNumber = this.importForm.get('phoneNumber')?.value?.trim();
    if (!phoneNumber) {
      this.notificationService.error(
        'Por favor, ingresa un número de teléfono válido.',
      );
      return;
    }

    // Obtener SID y Token: primero intentar desde el formulario, luego desde el perfil
    const twilioSid =
      this.importForm.get('twilioSid')?.value?.trim() || this.userTwilioSid;
    const twilioToken =
      this.importForm.get('twilioToken')?.value?.trim() || this.userTwilioToken;

    if (!twilioSid || !twilioToken) {
      this.notificationService.error(
        'Por favor, ingresa el Account SID y Auth Token de Twilio.',
      );
      return;
    }

    this.isImportLoading = true;
    this.twilioService
      .createPhoneNumber(
        this.selectedCountryCode,
        phoneNumber,
        twilioSid,
        twilioToken,
      )
      .subscribe({
        next: (response) => {
          this.isImportLoading = false;
          this.importErrorMessage = null;
          this.closeImportSidebar();
          this.notificationService.success(
            response?.message ||
              'El número de teléfono se ha importado correctamente.',
          );
          this.loadPhoneNumbers(
            this.searchTerm?.trim() ? this.searchTerm.trim() : undefined,
          );
        },
        error: (err: unknown) => {
          this.isImportLoading = false;
          const fallback =
            'Error al importar el número de teléfono. Por favor, intenta nuevamente.';
          let msg = getApiErrorMessage(err, fallback);
          const http = err as { status?: number };

          if (msg === 'Cannot POST /twilio/phone-number') {
            msg = fallback;
          }
          if (msg === fallback && http?.status === 400) {
            msg =
              'Las credenciales de Twilio o el número de teléfono no son válidos. Revisa los datos e inténtalo de nuevo.';
          } else if (http?.status === 404) {
            msg = 'Usuario no encontrado. Por favor, inicia sesión nuevamente.';
          } else if (http?.status === 0) {
            msg =
              'No se ha podido contactar con el servidor. Comprueba tu conexión a internet o inténtalo de nuevo en unos minutos.';
          }
          this.importErrorMessage = msg;

          // Marcar campos como con error para resaltar en rojo
          this.importForm.get('phoneNumber')?.setErrors({ server: true });
          this.importForm.get('twilioSid')?.setErrors({ server: true });
          this.importForm.get('twilioToken')?.setErrors({ server: true });
          this.importForm.markAllAsTouched();
        },
      });
  }

  // Método helper para formatear el número de teléfono
  formatPhoneNumber(countryCode: string, number: string): string {
    return `${countryCode} ${number}`;
  }

  // Método para abrir/cerrar el menú de acciones
  toggleMenu(index: number): void {
    if (this.openMenuIndex === index) {
      this.openMenuIndex = null;
    } else {
      this.openMenuIndex = index;
    }
  }

  // Método para editar número
  // (Funcionalidad de edición deshabilitada actualmente)

  // Método para eliminar número
  deleteNumber(index: number, phoneLabel: string): void {
    this.openMenuIndex = null;

    const phone = this.phoneNumbers[index];
    if (!phone) return;

    // Formatear el número para mostrar en el mensaje
    const formattedNumber = this.formatPhoneNumber(
      phone.countryCode,
      phone.number,
    );

    // Mostrar modal de confirmación (sin texto extra de detalle)
    const dialogRef = this.modalService.openWarning({
      title: 'Eliminar número de teléfono',
      message: `¿Está seguro de que desea eliminar el número "${formattedNumber}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Usuario confirmó la eliminación
        this.twilioService.deletePhoneNumber(phone.phoneId).subscribe({
          next: (response) => {
            // Mostrar mensaje de éxito con información sobre agentes afectados
            let message =
              'El número de teléfono se ha eliminado correctamente.';
            if (response.affectedAgents > 0) {
              message += ` ${response.affectedAgents} agente(s) que tenía(n) este número asignado se ha(n) vuelto inactivo(s).`;
            }
            this.notificationService.success(message);
            // Recargar la lista de números
            this.loadPhoneNumbers(
              this.searchTerm?.trim() ? this.searchTerm.trim() : undefined,
            );
          },
          error: (err) => {
            let errorMessage =
              'Error al eliminar el número de teléfono. Por favor, intenta nuevamente.';
            if (err?.status === 404) {
              errorMessage = 'El número de teléfono no existe.';
            } else if (err?.error?.message) {
              errorMessage = err.error.message;
            }
            this.notificationService.error(errorMessage);
          },
        });
      }
    });
  }

  // Cerrar menú al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) this.openMenuIndex = null;
    if (this.showImportSidebar && !target.closest('.country-dropdown-wrap'))
      this.showCountryMenu = false;
  }
}
