import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { UserStorage } from '../../storages/user/user-storage';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface CompanyType {
  id: string;
  name: string;
}

interface EmployeeRange {
  id: string;
  range: string;
}

@Component({
  selector: 'app-company-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './company-setup.component.html',
  styleUrl: './company-setup.component.scss'
})
export class CompanySetupComponent implements OnInit {

  // Servicios inyectados
  private userService = inject(UserService);
  private userStore = inject(UserStorage);
  private snackBar = inject(MatSnackBar);

  // Datos del formulario
  businessName: string = 'LLAMALO S.L';
  selectedCompanyType: string = '';
  selectedEmployeeRange: string = '';

  // Opciones para los dropdowns
  companyTypes: CompanyType[] = [
    { id: 'startup', name: 'Startup' },
    { id: 'small-business', name: 'Pequeña empresa' },
    { id: 'medium-business', name: 'Mediana empresa' },
    { id: 'large-corporation', name: 'Gran corporación' },
    { id: 'freelancer', name: 'Freelancer/Autónomo' },
    { id: 'non-profit', name: 'Organización sin ánimo de lucro' },
    { id: 'other', name: 'Otro' }
  ];

  employeeRanges: EmployeeRange[] = [
    { id: '1', range: '1 empleado' },
    { id: '2-5', range: '2-5 empleados' },
    { id: '6-10', range: '6-10 empleados' },
    { id: '11-50', range: '11-50 empleados' },
    { id: '51-200', range: '51-200 empleados' },
    { id: '201-500', range: '201-500 empleados' },
    { id: '500+', range: 'Más de 500 empleados' }
  ];

  // Opciones de uso principal
  mainUsageOptions = [
    {
      id: 'customer-service',
      name: 'Atención al cliente'
    },
    {
      id: 'appointments',
      name: 'Agendar citas'
    },
    {
      id: 'cart-recovery',
      name: 'Recuperación de carritos'
    },
    {
      id: 'phone-sales',
      name: 'Ventas telefónicas'
    }
  ];

  // Opciones seleccionadas (se pueden elegir varias)
  // Al entrar en el onboarding no debe haber ninguna tarjeta preseleccionada
  selectedMainUsages: string[] = [];

  // Animaciones zona 1 (onboarding - usos principales)
  // Solo se animan las tarjetas; el fondo blanco permanece siempre fijo
  isMainUsageAnimating = false;
  mainUsageSelectedForTransition: string | null = null;
  selectedCardFadingOut = false;

  // Animación de entrada suave para la zona 2
  step2ContentVisible = true;

  // Imagen derecha (mockup del onboarding)
  rightImageStep = 1; // 1 = zona 1, 2 = zona 2
  isRightImageFading = false;

  // Sonido de click para botones del onboarding
  // En SSR (Node) no existe `Audio`, así que lo inicializamos solo en navegador
  private clickAudio: HTMLAudioElement | null = null;

  // Intro de vídeo antes de la zona 1
  // Intro de bienvenida animada
  showWelcomeSequence = true;
  isWelcomeFading = false;
  welcomeExitTriggered = false;

  // Paso 2: opciones de cómo nos conociste
  discoveryOptions = [
    { id: 'social', label: 'Redes sociales (Instagram / TikTok / Twitter / LinkedIn)' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'google', label: 'Google / Buscando alternativas' },
    { id: 'communities', label: 'Comunidades / Grupos (Slack, Discord, Telegram)' },
    { id: 'events', label: 'Evento o webinar' },
    { id: 'friend', label: 'Recomendación de un amigo o colega' },
    { id: 'other-source', label: 'Otro' }
  ];

  selectedDiscoveryChannels: string[] = [];

  // Estado para el logo
  selectedLogo: File | null = null;
  logoPreview: string | null = null;

  // Estado para controlar si el setup está activo
  isSetupActive: boolean = false;

  // Estado para controlar el paso actual
  currentStep: number = 1;
  maxStep: number = 3;

  constructor(private router: Router) { }

  ngOnInit() {
    // Aquí podrías verificar si el usuario ya completó el setup
    // Por defecto está desactivado, se activa con el botón
    this.isSetupActive = false;
    this.showWelcomeSequence = true;
    this.startWelcomeSequence();

    // Inicializar audio solo en entorno navegador para evitar errores en SSR
    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      this.clickAudio = new Audio('assets/click.mp3');
    }
    // Cargar la imagen de perfil existente del usuario
    const currentUser = this.userStore.user();
    if (currentUser?.profileImage) {
      this.logoPreview = currentUser.profileImage;
    }
  }

  // Método para activar/desactivar el setup (para testing)
  toggleSetup() {
    this.isSetupActive = !this.isSetupActive;
    if (this.isSetupActive) {
      this.currentStep = 1;
      this.step2ContentVisible = true;
      this.showWelcomeSequence = true;
      this.welcomeExitTriggered = false;
      this.isWelcomeFading = false;
      this.startWelcomeSequence();
    }
  }

  // Reproducir sonido de click (con manejo básico de errores)
  playClick() {
    if (!this.clickAudio) {
      return;
    }
    try {
      this.clickAudio.currentTime = 0;
      this.clickAudio.play();
    } catch (e) {
      console.error('No se pudo reproducir el sonido de click', e);
    }
  }

  // Control de la intro de vídeo
  startWelcomeSequence() {
    setTimeout(() => {
      this.welcomeExitTriggered = true;
      setTimeout(() => {
        this.showWelcomeSequence = false;
      }, 1000); // Duración de la animación de salida (cortina)
    }, 5000); // 5 segundos de espera
  }

  skipWelcome() {
    this.welcomeExitTriggered = true;
    setTimeout(() => {
      this.showWelcomeSequence = false;
    }, 200);
  }

  // Método para continuar con la configuración
  continueSetup() {
    this.goToStep(this.currentStep + 1);
  }

  // Método para seleccionar una opción de uso principal
  selectMainUsage(usageId: string) {
    console.log('selectMainUsage called with:', usageId);
    console.log('Current selectedMainUsages:', this.selectedMainUsages);

    const index = this.selectedMainUsages.indexOf(usageId);
    if (index > -1) {
      // Si ya está seleccionada, la deselecciona
      this.selectedMainUsages.splice(index, 1);
    } else {
      // Si no está seleccionada, la añade a la lista
      this.selectedMainUsages.push(usageId);
    }

    console.log('New selectedMainUsages:', this.selectedMainUsages);
  }

  // Maneja el click en una tarjeta de la zona 1 con animación y cambio suave a la zona 2
  handleMainUsageClick(usageId: string) {
    // Evitar dobles clics mientras la animación está en curso
    if (this.isMainUsageAnimating) {
      return;
    }

    // Dejamos únicamente la opción pulsada como seleccionada
    this.selectedMainUsages = [usageId];
    this.mainUsageSelectedForTransition = usageId;
    this.isMainUsageAnimating = true;
    this.selectedCardFadingOut = false;
    this.step2ContentVisible = false;

    // 1) Animar: las demás tarjetas se desvanecen (controlado por *ngClass)
    // 2) Mantener un tiempo la tarjeta seleccionada visible
    const selectedVisibleDelay = 550; // ms con la tarjeta seleccionada visible sola
    const selectedFadeOutDuration = 250; // ms de fade-out del recuadro seleccionado
    const step2DelayAfterFade = 200; // ms extra antes de mostrar contenido de zona 2

    // Fase 1: mantener seleccionada
    setTimeout(() => {
      // Fase 2: iniciar fade-out suave del recuadro seleccionado
      this.selectedCardFadingOut = true;

      setTimeout(() => {
        // Fase 3: cambiar al paso 2 (ya sin ver el recuadro seleccionado)
        this.goToStep(2);

        // Fase 4: mostrar suavemente el contenido de la zona 2
        setTimeout(() => {
          this.step2ContentVisible = true;
          this.isMainUsageAnimating = false;
          this.mainUsageSelectedForTransition = null;
          this.selectedCardFadingOut = false;
        }, step2DelayAfterFade);
      }, selectedFadeOutDuration);
    }, selectedVisibleDelay);
  }

  // Paso 2: seleccionar cómo nos conociste (multi-selección sencilla)
  toggleDiscoveryChannel(channelId: string) {
    const index = this.selectedDiscoveryChannels.indexOf(channelId);
    if (index > -1) {
      this.selectedDiscoveryChannels.splice(index, 1);
    } else {
      this.selectedDiscoveryChannels.push(channelId);
    }
  }

  // Método para saltar la configuración
  skipSetup() {
    if (this.currentStep === 1) {
      // Si estamos en el paso 1, ir al paso 2
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      // Si estamos en el paso 2, ir al paso 3
      this.currentStep = 3;
    } else if (this.currentStep === 3) {
      // Si estamos en el paso 3, ir al paso 4
      this.currentStep = 4;
    } else if (this.currentStep === 4) {
      // Si estamos en el paso 4, completar el setup
      this.completeSetup();
    }
  }

  // Método para ir hacia atrás
  goBack() {
    // Animación especial al volver del paso 2 al paso 1
    if (this.currentStep === 2) {
      const backFadeDuration = 300; // ms para desvanecer la zona 2

      // Iniciar fade-out del contenido de la zona 2
      this.step2ContentVisible = false;

      setTimeout(() => {
        this.goToStep(1);
      }, backFadeDuration);

      return;
    }

    this.goToStep(this.currentStep - 1);
  }

  // Método genérico para ir a un paso concreto
  goToStep(step: number) {
    if (step < 1) {
      step = 1;
    }
    if (step > this.maxStep) {
      step = this.maxStep;
    }

    const previousStep = this.currentStep;
    this.currentStep = step;

    // Si se navega a la zona 2 sin venir de la animación de la zona 1,
    // aseguramos que su contenido esté visible inmediatamente.
    if (step === 2 && !this.isMainUsageAnimating) {
      this.step2ContentVisible = true;
    }

    // Transición suave de la imagen derecha entre pasos 1 y 2
    if ((step === 1 || step === 2) && step !== previousStep) {
      this.triggerRightImageTransition(step);
    }
  }

  private triggerRightImageTransition(targetStep: number) {
    if (targetStep === this.rightImageStep || (targetStep !== 1 && targetStep !== 2)) {
      return;
    }

    const fadeDuration = 350; // ms
    this.isRightImageFading = true;

    setTimeout(() => {
      this.rightImageStep = targetStep;
      this.isRightImageFading = false;
    }, fadeDuration);
  }

  // Método para manejar la subida del logo
  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.showNotification(
          'Por favor, selecciona un archivo de imagen válido',
          'error'
        );
        return;
      }

      // Validar tamaño (máximo 10MB - más permisivo)
      if (file.size > 10 * 1024 * 1024) {
        this.showNotification('La imagen debe ser menor a 10MB', 'error');
        return;
      }

      console.log('Archivo seleccionado:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Mostrar preview inmediatamente
      this.selectedLogo = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
        console.log('Preview generado correctamente');
      };
      reader.readAsDataURL(file);

      // Mostrar notificación de carga
      this.showNotification('Subiendo imagen...', 'success');

      // TEMPORAL: Mantener la imagen local sin subir al backend por ahora
      setTimeout(() => {
        this.showNotification('Imagen cargada correctamente (modo local)', 'success');
      }, 1000);

      return; // Salir aquí temporalmente para evitar la subida al backend

      // Subir al backend
      this.userService.uploadProfileImage(file).subscribe({
        next: (response: any) => {
          console.log('Respuesta del backend:', response);

          // Verificar que la respuesta tenga la URL de la imagen
          if (response && response.imageUrl) {
            // Actualizar el usuario en el storage con la nueva imagen
            const currentUser = this.userStore.user();
            if (currentUser) {
              const updatedUser = {
                ...currentUser,
                profileImage: response.imageUrl
              };
              this.userStore.setUser(updatedUser);
            }

            // Actualizar el preview con la URL del backend
            this.logoPreview = response.imageUrl;
            this.showNotification('Logo subido correctamente', 'success');
          } else {
            console.error('Respuesta del backend sin imageUrl:', response);
            this.showNotification(
              'Error: No se recibió la URL de la imagen del servidor',
              'error'
            );
          }
        },
        error: (error: any) => {
          console.error('Error completo al subir imagen:', error);
          this.showNotification(
            `Error al subir la imagen: ${error.message || 'Error desconocido'}`,
            'error'
          );
          // NO limpiar el preview en caso de error - mantener la imagen local
          // this.logoPreview = null;
          // this.selectedLogo = null;
        },
      });
    }
  }

  // Método para activar el input de archivo
  triggerFileUpload() {
    const fileInput = document.getElementById('logoUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Método para completar el setup
  completeSetup() {
    // Aquí marcarías en el backend que el usuario completó el setup
    this.isSetupActive = false;
    this.router.navigate(['/dashboard/home']);
  }

  // Método para mostrar notificaciones
  private showNotification(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  // Validar si el formulario es válido
  private isFormValid(): boolean {
    return this.businessName.trim() !== '' &&
      this.selectedCompanyType !== '' &&
      this.selectedEmployeeRange !== '';
  }

  // Getter para verificar si el formulario es válido
  get isFormComplete(): boolean {
    return this.isFormValid();
  }

  // Getter para obtener el nombre del tipo de empresa seleccionado
  get selectedCompanyTypeName(): string {
    const type = this.companyTypes.find(t => t.id === this.selectedCompanyType);
    return type ? type.name : '';
  }

  // Getter para obtener el rango de empleados seleccionado
  get selectedEmployeeRangeName(): string {
    const range = this.employeeRanges.find(r => r.id === this.selectedEmployeeRange);
    return range ? range.range : '';
  }
}
