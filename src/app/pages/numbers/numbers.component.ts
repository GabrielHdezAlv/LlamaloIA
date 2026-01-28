import { Component, inject, OnInit, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef, HostListener } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';
import { Router } from '@angular/router';
import { RippleButtonComponent } from '../../shared/components/ripple-button/ripple-button.component';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ModalService } from '../../shared/modals/modal.service';
import { UserService } from '../../core/services/user.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TwilioService } from '../../core/services/twilio.service';

interface PhoneNumberDisplay {
  phoneId: number;
  countryCode: string;
  number: string;
  label?: string;
  state: "Activo" | "Inactivo";
  importedBy: string;
}

@Component({
  selector: 'app-numbers',
  imports: [RippleButtonComponent, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './numbers.component.html',
  styleUrl: './numbers.component.scss'
})
export class NumbersComponent implements OnInit, AfterViewInit {
  private i18nService = inject(I18nService);
  router = inject(Router);
  private modalService = inject(ModalService);
  private userService = inject(UserService);
  private twilioService = inject(TwilioService);
  private fb = inject(FormBuilder);
  private cdr: ChangeDetectorRef;

  // Variable para controlar la animación de fade in
  showContent: boolean = false;

  // Lista de números de teléfono para mostrar en la tabla
  phoneNumbers: PhoneNumberDisplay[] = [];
  openMenuIndex: number | null = null;

  // Importar número: dropdown + sidebar
  showImportDropdown = false;
  showImportSidebar = false;
  importForm: FormGroup;
  isImportLoading = false;
  showCountryMenu = false;
  selectedCountryCode = '+34';
  selectedCountry = 'es';
  routingRegionEnabled = false;

  private isBrowser: boolean;
  private userTwilioSid: string | null = null;
  private userTwilioToken: string | null = null;
  importErrorMessage: string | null = null;

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    cdr: ChangeDetectorRef
  ) {
      this.i18nService.initializeLanguage();
      this.isBrowser = isPlatformBrowser(this.platformId);
      this.cdr = cdr;
      this.importForm = this.fb.group({
        phoneNumber: ['', Validators.required],
        twilioSid: [''],
        twilioToken: [''],
        label: [''] // Etiqueta opcional para el número importado
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

  ngOnInit(): void {
    // Obtener los phoneNumbers del usuario al entrar
    this.loadPhoneNumbers();
  }

  // Método para cargar los números de teléfono del perfil
  private loadPhoneNumbers(): void {
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        console.log('📞 PhoneNumbers del usuario:', profile.phoneNumbers);
        console.log('📞 Perfil completo:', profile);
        
        // Mapear los phoneNumbers del usuario a la estructura de la tabla
        if (profile.phoneNumbers && profile.phoneNumbers.length > 0) {
          this.phoneNumbers = profile.phoneNumbers.map((phone, index) => ({
            phoneId: phone.phoneId || index + 1,
            countryCode: phone.countryCode || '',
            number: String(phone.number || ''), // Convertir a string por si viene como número
            label: `ID ${phone.phoneId || index + 1}`, // Generar label basado en phoneId
            state: phone.state || 'Activo', // Usar state del backend o 'Activo' por defecto
            importedBy: phone.importedBy || 'Twilio' // Usar importedBy del backend o 'Twilio' por defecto
          }));
          console.log('📞 PhoneNumbers mapeados:', this.phoneNumbers);
          console.log('📞 Cantidad de números:', this.phoneNumbers.length);
          // Forzar detección de cambios
          this.cdr.detectChanges();
        } else {
          this.phoneNumbers = [];
          console.log('📞 No hay phoneNumbers en el perfil');
          console.log('📞 Array phoneNumbers vacío:', this.phoneNumbers);
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al obtener el perfil del usuario:', error);
        this.phoneNumbers = [];
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {
    // Ejecutar animación después de que la vista esté completamente inicializada
    this.startFadeInAnimation();
  }

  private startFadeInAnimation(): void {
    console.log('NumbersComponent startFadeInAnimation - isBrowser:', this.isBrowser);
    
    // Verificar si estamos en el navegador de manera más robusta
    const isInBrowser = typeof window !== 'undefined' && window.localStorage;
    console.log('Verificación robusta del navegador:', isInBrowser);
    
    if (!isInBrowser) {
      console.log('No es navegador, mostrando contenido inmediatamente');
      this.showContent = true;
      this.cdr.detectChanges();
      return;
    }

    console.log('Ejecutando animación con delay...');
    
    // Contenido aparece después de 100ms
    setTimeout(() => {
      console.log('Mostrando contenido de números');
      this.showContent = true;
      this.cdr.detectChanges();
    }, 100);
  }

  toggleImportDropdown(): void {
    this.showImportDropdown = !this.showImportDropdown;
  }

  openImportFromTwilio(): void {
    this.showImportDropdown = false;
    this.importErrorMessage = null;
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        const hasTwilioConfig = profile.twilio?.twilioSid && profile.twilio?.twilioToken;
        if (!hasTwilioConfig) {
          this.modalService.openError({
            title: 'Configuración de Twilio requerida',
            message: 'Para importar un número de teléfono, primero debes configurar tus credenciales de Twilio. Por favor, ve a Ajustes > Conexiones > Twilio para configurar tu Account SID y Auth Token.'
          });
          return;
        }
        // Guardar credenciales de Twilio del usuario para utilizarlas al importar
        this.userTwilioSid = profile.twilio!.twilioSid;
        this.userTwilioToken = profile.twilio!.twilioToken;

        this.showImportSidebar = true;
        // Limpiar solo el número y etiqueta; las credenciales se obtienen del perfil
        this.importForm.reset({ phoneNumber: '' });
        this.selectedCountryCode = '+34';
        this.selectedCountry = 'es';
        this.routingRegionEnabled = false;
      },
      error: () => {
        this.modalService.openError({
          title: 'Configuración de Twilio requerida',
          message: 'Para importar un número de teléfono, primero debes configurar tus credenciales de Twilio. Por favor, ve a Ajustes > Conexiones > Twilio para configurar tu Account SID y Auth Token.'
        });
      }
    });
  }

  closeImportSidebar(): void {
    this.showImportSidebar = false;
    this.showCountryMenu = false;
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
      this.modalService.openError({
        title: 'Número de teléfono requerido',
        message: 'Por favor, ingresa un número de teléfono válido.'
      });
      return;
    }

    // Obtener SID y Token: si en el futuro se permite sobrescribir desde el formulario,
    // se podrían leer de ahí; por ahora usamos los almacenados en el perfil del usuario.
    const twilioSid = this.userTwilioSid;
    const twilioToken = this.userTwilioToken;

    if (!twilioSid || !twilioToken) {
      this.modalService.openError({
        title: 'Configuración de Twilio requerida',
        message: 'No se han encontrado las credenciales de Twilio del usuario. Por favor, verifica tu configuración en Ajustes > Conexiones > Twilio.'
      });
      return;
    }

    this.isImportLoading = true;
    this.twilioService
      .createPhoneNumber(this.selectedCountryCode, phoneNumber, twilioSid, twilioToken)
      .subscribe({
      next: (response) => {
        this.isImportLoading = false;
        this.importErrorMessage = null;
        this.closeImportSidebar();
        this.modalService.openSuccess({
          title: 'Número importado',
          message: response?.message || 'El número de teléfono se ha importado correctamente.'
        });
        this.loadPhoneNumbers();
      },
      error: (err) => {
        this.isImportLoading = false;
        let msg = 'Error al importar el número de teléfono. Por favor, intenta nuevamente.';
        const backendMessage: string | undefined = err?.error?.message || err?.message;

        if (backendMessage && backendMessage !== 'Cannot POST /twilio/phone-number') {
          msg = backendMessage;
        } else if (err?.status === 400) {
          msg = 'Las credenciales de Twilio o el número de teléfono no son válidos. Revisa los datos e inténtalo de nuevo.';
        } else if (err?.status === 404) {
          msg = 'Usuario no encontrado. Por favor, inicia sesión nuevamente.';
        } else if (err?.status === 0) {
          msg = 'No se ha podido contactar con el servidor. Comprueba tu conexión a internet o inténtalo de nuevo en unos minutos.';
        }
        this.importErrorMessage = msg;

        // Marcar campos como con error para resaltar en rojo
        this.importForm.get('phoneNumber')?.setErrors({ server: true });
        this.importForm.get('twilioSid')?.setErrors({ server: true });
        this.importForm.get('twilioToken')?.setErrors({ server: true });
        this.importForm.markAllAsTouched();
      }
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
    const formattedNumber = this.formatPhoneNumber(phone.countryCode, phone.number);

    // Mostrar modal de confirmación
    const dialogRef = this.modalService.openWarning({
      title: 'Eliminar número de teléfono',
      message: `¿Está seguro de que desea eliminar el número "${formattedNumber}"?`,
      details: 'Al eliminar este número, si hay algún agente con este número asignado, se volverá inactivo.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Usuario confirmó la eliminación
        this.twilioService.deletePhoneNumber(phone.phoneId).subscribe({
          next: (response) => {
            // Mostrar mensaje de éxito con información sobre agentes afectados
            let message = 'El número de teléfono se ha eliminado correctamente.';
            if (response.affectedAgents > 0) {
              message += ` ${response.affectedAgents} agente(s) que tenía(n) este número asignado se ha(n) vuelto inactivo(s).`;
            }
            this.modalService.openSuccess({
              title: 'Número eliminado',
              message: message
            });
            // Recargar la lista de números
            this.loadPhoneNumbers();
          },
          error: (err) => {
            let errorMessage = 'Error al eliminar el número de teléfono. Por favor, intenta nuevamente.';
            if (err?.status === 404) {
              errorMessage = 'El número de teléfono no existe.';
            } else if (err?.error?.message) {
              errorMessage = err.error.message;
            }
            this.modalService.openError({
              title: 'Error al eliminar número',
              message: errorMessage
            });
          }
        });
      }
    });
  }

  // Cerrar menú al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) this.openMenuIndex = null;
    if (!target.closest('.import-dropdown-wrap')) this.showImportDropdown = false;
    if (this.showImportSidebar && !target.closest('.country-dropdown-wrap')) this.showCountryMenu = false;
  }

}
