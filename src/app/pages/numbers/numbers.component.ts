import { Component, inject, OnInit, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';
import { Router } from '@angular/router';
import { RippleButtonComponent } from '../../shared/components/ripple-button/ripple-button.component';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ModalService } from '../../shared/modals/modal.service';
import { UserService } from '../../core/services/user.service';

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
  imports: [RippleButtonComponent, CommonModule],
  templateUrl: './numbers.component.html',
  styleUrl: './numbers.component.scss'
})
export class NumbersComponent implements OnInit, AfterViewInit {
  private i18nService = inject(I18nService);
  router = inject(Router);
  private modalService = inject(ModalService);
  private userService = inject(UserService);
  private cdr: ChangeDetectorRef;

  // Variable para controlar la animación de fade in
  showContent: boolean = false;

  // Lista de números de teléfono para mostrar en la tabla
  phoneNumbers: PhoneNumberDisplay[] = [];

  private isBrowser: boolean;

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
            label: `Número ${phone.phoneId || index + 1}`, // Generar label basado en phoneId
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

  openImportNumberModal(): void {
    // Verificar si el usuario tiene configuración de Twilio antes de abrir el modal
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        const hasTwilioConfig = profile.twilio?.twilioSid && profile.twilio?.twilioToken;
        
        if (!hasTwilioConfig) {
          // Mostrar modal indicando que debe configurar Twilio primero
          this.modalService.openError({
            title: 'Configuración de Twilio requerida',
            message: 'Para importar un número de teléfono, primero debes configurar tus credenciales de Twilio. Por favor, ve a Ajustes > Conexiones > Twilio para configurar tu Account SID y Auth Token.'
          });
        } else {
          // Si tiene la configuración, abrir el modal de importar número
          const dialogRef = this.modalService.openImportNumber({
            title: 'Importar Número de Teléfono',
            message: 'Importa un número de teléfono desde tu proveedor de servicios de telecomunicaciones.'
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log('Número importado:', result);
              
              // Mostrar mensaje de éxito
              this.modalService.openSuccess({
                title: 'Número importado',
                message: 'El número de teléfono se ha importado correctamente.'
              });
              
              // Actualizar el perfil y recargar los números de teléfono
              this.loadPhoneNumbers();
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al verificar configuración de Twilio:', error);
        // En caso de error, mostrar el modal de todas formas para ser seguro
        this.modalService.openError({
          title: 'Configuración de Twilio requerida',
          message: 'Para importar un número de teléfono, primero debes configurar tus credenciales de Twilio. Por favor, ve a Ajustes > Conexiones > Twilio para configurar tu Account SID y Auth Token.'
        });
      }
    });
  }

  // Método helper para formatear el número de teléfono
  formatPhoneNumber(countryCode: string, number: string): string {
    return `${countryCode} ${number}`;
  }

}
