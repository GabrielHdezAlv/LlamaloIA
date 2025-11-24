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
  templateUrl: './company-setup.component.html'
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
  selectedMainUsages: string[] = ['confirmations-reminders'];

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

  constructor(private router: Router) {}

  ngOnInit() {
    // Aquí podrías verificar si el usuario ya completó el setup
    // Por defecto está desactivado, se activa con el botón
    this.isSetupActive = false;
    
    // Cargar la imagen de perfil existente del usuario
    const currentUser = this.userStore.user();
    if (currentUser?.profileImage) {
      this.logoPreview = currentUser.profileImage;
    }
  }

  // Método para activar/desactivar el setup (para testing)
  toggleSetup() {
    this.isSetupActive = !this.isSetupActive;
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
    this.currentStep = step;
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
