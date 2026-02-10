import {
  Component,
  ViewChild,
  AfterViewInit,
  OnInit,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID,
  computed,
  inject,
} from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavComponent } from '../../layout/nav/nav.component';
import { TopbarComponent } from '../../layout/topbar/topbar.component';
import { CompanySetupComponent } from '../company-setup/company-setup.component';
import { UserStorage } from '../../storages/user/user-storage';
import {
  ReminderService,
  ReminderData,
} from '../../core/services/reminder.service';
import { I18nService, Language } from '../../core/services/i18n.service';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule,
    TopbarComponent,
    NavComponent,
    CompanySetupComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild(CompanySetupComponent)
  companySetupComponent!: CompanySetupComponent;
  @ViewChild(NavComponent) navComponent!: NavComponent;
  private _isNavCollapsed: boolean = true;

  showCompanySetup = false;
  showMobileSidebar = false;
  showInactiveReminderModal = false;
  uploadedImage: string | null = null;

  // Lista de recordatorios
  reminders: ReminderData[] = [];
  currentReminderIndex = 0;

  // Datos del recordatorio actual
  reminderData: ReminderData = {
    id: '',
    imageUrl: '',
    title: '',
    description: '',
    learnMoreUrl: '',
    showNewTag: true,
  };

  // Variables para swipe/drag
  touchStartX = 0;
  touchStartY = 0;
  touchEndX = 0;
  touchEndY = 0;
  isDragging = false;

  // Variables para animación
  isTransitioning = false;
  slideDirection: 'left' | 'right' | null = null;

  // Inyectar servicios
  public userStorage = inject(UserStorage);
  private reminderService = inject(ReminderService);
  private router = inject(Router);
  public i18nService = inject(I18nService);
  private navigationService = inject(NavigationService);

  // Dropdown del perfil
  showDropdown = false;

  // Barras del progreso del onboarding
  progressBars = Array.from({ length: 32 });
  onboardingProgress = 35;

  // Modo oscuro desde el sidebar móvil
  isDarkMode = false;
  isMobileSidebarClosing = false;

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  async ngOnInit() {
    // Lógica que depende de window / documento (solo en navegador)
    if (isPlatformBrowser(this.platformId)) {
      // Inicializar modo oscuro desde localStorage / preferencia del sistema
      const storedTheme = localStorage.getItem('llamalo-theme');
      if (storedTheme === 'dark') {
        this.setDarkMode(true, false);
      } else if (storedTheme === 'light') {
        this.setDarkMode(false, false);
      } else {
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        this.setDarkMode(prefersDark, false);
      }

      window.addEventListener('openMobileSidebar', () => {
        this.openMobileSidebar();
      });

      // Escuchar evento para abrir el modal de recordatorios desde el sidebar
      window.addEventListener('openReminderModal', () => {
        this.openInactiveReminderModal();
      });
    }

    // Cargar datos del recordatorio
    await this.loadReminderData();
  }

  async loadReminderData(): Promise<void> {
    const list = await this.reminderService.getRemindersList();
    this.reminders = list.reminders;

    if (this.reminders.length > 0) {
      // Si hay recordatorios, mostrar el primero o el activo
      if (list.activeId) {
        const activeIndex = this.reminders.findIndex(
          (r) => r.id === list.activeId,
        );
        this.currentReminderIndex = activeIndex !== -1 ? activeIndex : 0;
      } else {
        this.currentReminderIndex = 0;
      }
      this.reminderData = { ...this.reminders[this.currentReminderIndex] };
    } else {
      // Si no hay recordatorios, usar valores por defecto
      const defaults =
        await this.reminderService.getActiveReminderWithDefaults();
      this.reminderData = { ...defaults };
    }
  }

  async nextReminder(): Promise<void> {
    if (this.reminders.length > 0 && !this.isTransitioning) {
      this.isTransitioning = true;
      this.slideDirection = 'left';

      // Esperar a que termine la animación de salida
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Cambiar el contenido
      this.currentReminderIndex =
        (this.currentReminderIndex + 1) % this.reminders.length;
      this.reminderData = { ...this.reminders[this.currentReminderIndex] };

      // Resetear para la animación de entrada
      setTimeout(() => {
        this.isTransitioning = false;
        this.slideDirection = null;
      }, 50);
    }
  }

  async previousReminder(): Promise<void> {
    if (this.reminders.length > 0 && !this.isTransitioning) {
      this.isTransitioning = true;
      this.slideDirection = 'right';

      // Esperar a que termine la animación de salida
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Cambiar el contenido
      this.currentReminderIndex =
        this.currentReminderIndex === 0
          ? this.reminders.length - 1
          : this.currentReminderIndex - 1;
      this.reminderData = { ...this.reminders[this.currentReminderIndex] };

      // Resetear para la animación de entrada
      setTimeout(() => {
        this.isTransitioning = false;
        this.slideDirection = null;
      }, 50);
    }
  }

  async selectReminder(index: number): Promise<void> {
    if (
      index >= 0 &&
      index < this.reminders.length &&
      !this.isTransitioning &&
      index !== this.currentReminderIndex
    ) {
      const direction = index > this.currentReminderIndex ? 'left' : 'right';
      this.isTransitioning = true;
      this.slideDirection = direction;

      // Esperar a que termine la animación de salida
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Cambiar el contenido
      this.currentReminderIndex = index;
      this.reminderData = { ...this.reminders[this.currentReminderIndex] };

      // Resetear para la animación de entrada
      setTimeout(() => {
        this.isTransitioning = false;
        this.slideDirection = null;
      }, 50);
    }
  }

  // Métodos para swipe/drag
  onTouchStart(event: TouchEvent): void {
    if (this.reminders.length <= 1) return;
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.isDragging = true;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    event.preventDefault();
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.isDragging || this.reminders.length <= 1) return;
    this.touchEndX = event.changedTouches[0].clientX;
    this.touchEndY = event.changedTouches[0].clientY;
    this.handleSwipe();
    this.isDragging = false;
  }

  onMouseDown(event: MouseEvent): void {
    if (this.reminders.length <= 1) return;
    this.touchStartX = event.clientX;
    this.touchStartY = event.clientY;
    this.isDragging = true;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    event.preventDefault();
  }

  onMouseUp(event: MouseEvent): void {
    if (!this.isDragging || this.reminders.length <= 1) return;
    this.touchEndX = event.clientX;
    this.touchEndY = event.clientY;
    this.handleSwipe();
    this.isDragging = false;
  }

  handleSwipe(): void {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const minSwipeDistance = 50; // Distancia mínima para considerar un swipe

    // Solo procesar si el movimiento horizontal es mayor que el vertical
    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > minSwipeDistance
    ) {
      if (deltaX > 0) {
        // Swipe hacia la derecha - ir al anterior
        this.previousReminder();
      } else {
        // Swipe hacia la izquierda - ir al siguiente
        this.nextReminder();
      }
    }
  }

  ngAfterViewInit() {
    // Inicializar el estado y forzar la detección de cambios del sidebar
    this._isNavCollapsed = this.navComponent?.isCollapsed ?? true;
    this.cdr.detectChanges();
  }

  get isNavCollapsed(): boolean {
    if (this.navComponent) {
      this._isNavCollapsed = this.navComponent.isCollapsed;
    }
    return this._isNavCollapsed;
  }

  toggleCompanySetup() {
    this.showCompanySetup = !this.showCompanySetup;
    if (this.companySetupComponent) {
      this.companySetupComponent.toggleSetup();
    }
  }

  openInactiveReminderModal() {
    this.showInactiveReminderModal = true;
  }

  closeInactiveReminderModal() {
    this.showInactiveReminderModal = false;
  }

  saveInactiveReminderSettings() {
    // Aquí se implementará la lógica para guardar la configuración
    this.closeInactiveReminderModal();
  }

  onImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.uploadedImage = e.target.result as string;
        }
      };

      reader.readAsDataURL(file);
    }
  }

  openMobileSidebar() {
    this.isMobileSidebarClosing = false;
    this.showMobileSidebar = true;

    // Añadir clase global para indicar que el sidebar móvil está abierto (solo navegador)
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.classList.add('mobile-sidebar-open');
    }
  }

  closeMobileSidebar() {
    if (this.isMobileSidebarClosing) return;
    this.isMobileSidebarClosing = true;

    // Quitar clase global cuando el sidebar móvil se cierra
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.classList.remove('mobile-sidebar-open');
    }

    // Esperar a que termine la animación de cortina antes de ocultar el sidebar
    setTimeout(() => {
      this.showMobileSidebar = false;
      this.isMobileSidebarClosing = false;
    }, 400);
  }

  // Toggle modo oscuro desde el sidebar móvil
  toggleDarkMode() {
    this.setDarkMode(!this.isDarkMode, true);
  }

  private setDarkMode(enabled: boolean, persist: boolean) {
    this.isDarkMode = enabled;
    if (!isPlatformBrowser(this.platformId)) return;

    const root = document.documentElement;
    if (enabled) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (persist) {
      localStorage.setItem('llamalo-theme', enabled ? 'dark' : 'light');
    }
  }

  // Método para obtener el nombre del usuario
  userName = computed(() => {
    const user = this.userStorage.user();
    if (user) {
      return `${user.name} ${user.lastname}`;
    }
    return 'Usuario';
  });

  // Método para obtener la imagen del perfil del usuario
  getUserProfileImage = () => {
    const user = this.userStorage.user();
    return user?.profileImage || 'assets/predeterminada.webp';
  };

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  // Método para verificar si una ruta está activa
  isRouteActive(route: string): boolean {
    const currentUrl = this.router.url;

    // Caso especial: /dashboard/agents o /dashboard/agents/create o /dashboard/agents/edit → resaltar "Agentes"
    if (route === '/dashboard/agents') {
      return (
        currentUrl === '/dashboard/agents' ||
        currentUrl === '/dashboard/agents/create' ||
        currentUrl.startsWith('/dashboard/agents/edit/')
      );
    }

    // Para la ruta de inicio, también activar cuando esté en /dashboard sin nada más
    if (route === '/dashboard/home') {
      return currentUrl === '/dashboard/home' || currentUrl === '/dashboard';
    }

    // Para otras rutas, verificar coincidencia exacta
    return currentUrl === route;
  }

  // Método para abrir/cerrar dropdown
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  // Navegar a ruta usando el servicio de navegación
  navigateTo(route: string) {
    if (route === '/dashboard/community') {
      // Redirigir al canal de Telegram de Llamalo AI
      window.open('https://t.me/+wDgRI51qiW1mZjdk', '_blank');
    } else {
      // Usar el servicio de navegación para mantener la URL limpia
      const routeName = route.replace('/dashboard/', '');
      this.navigationService.navigateToRoute(routeName);
    }
    this.showDropdown = false;
    this.closeMobileSidebar();
  }

  // Ir a la sección de regalos en account
  goToGifts() {
    this.router.navigate(['/dashboard/account'], {
      queryParams: { tab: 'gifts' },
    });
    this.showDropdown = false;
    this.closeMobileSidebar();
  }

  // Cerrar sesión
  logout() {
    // Limpiar datos de usuario
    this.userStorage.clearUser();
    this.router.navigate(['/login']);
  }

  // Seleccionar idioma
  selectLanguage(lang: Language) {
    this.i18nService.setLanguage(lang);
  }

  // Estilo dinámico para cada barra según el progreso
  getBarStyle(index: number) {
    const total = this.progressBars.length;
    const filledBars = (this.onboardingProgress / 100) * total;
    const isFilled = index < filledBars;

    if (!isFilled) {
      return { background: '#E5E7EB' };
    }

    // Gradiente de azul intenso a casi negro en las barras llenas
    const lightStart = 48;
    const lightEnd = 14;
    const lightness =
      lightStart + (index / Math.max(total - 1, 1)) * (lightEnd - lightStart);

    return { background: `hsl(220, 90%, ${lightness}%)` };
  }
}
