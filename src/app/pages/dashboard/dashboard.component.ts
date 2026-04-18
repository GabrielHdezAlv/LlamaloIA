import {
  Component,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID,
  computed,
  inject,
  effect,
  untracked,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  RouterOutlet,
  RouterModule,
  Router,
  NavigationEnd,
  NavigationStart,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavComponent } from '../../layout/nav/nav.component';
import { TopbarComponent } from '../../layout/topbar/topbar.component';
import { UserStorage } from '../../storages/user/user-storage';
import {
  ReminderService,
  ReminderData,
} from '../../core/services/reminder.service';
import { I18nService, Language } from '../../core/services/i18n.service';
import { NavigationService } from '../../core/services/navigation.service';
import { SHOW_HISTORIAL_NAV } from '../../core/constants/features';
import { AuthSessionService } from '../../core/services/auth-session.service';
import { ModalService } from '../../shared/modals/modal.service';
import {
  requiresBillingChurnLockPage,
  requiresPaymentFailureSubscribePage,
  requiresSubscriptionPaywall,
} from '../../shared/utils/plan-usage.util';
import { FirstAgentTourService } from '../../core/services/first-agent-tour.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule,
    TopbarComponent,
    NavComponent,
    SpinnerComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(NavComponent) navComponent!: NavComponent;
  private _isNavCollapsed: boolean = true;
  showMobileSidebar = false;
  showInactiveReminderModal = false;
  uploadedImage: string | null = null;

  /** Ocultar enlace a Historial en el menú móvil. Ver core/constants/features.ts */
  showHistorialNav = SHOW_HISTORIAL_NAV;

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
  private authSession = inject(AuthSessionService);
  private reminderService = inject(ReminderService);
  private router = inject(Router);
  public i18nService = inject(I18nService);
  private navigationService = inject(NavigationService);
  private modalService = inject(ModalService);
  private matDialog = inject(MatDialog);
  private firstAgentTour = inject(FirstAgentTourService);

  /** Trial agotado o pago Stripe pendiente: bloquear UI y mostrar solo modal de precios. */
  subscriptionPaywallActive = computed(() =>
    requiresSubscriptionPaywall(this.userStorage.user()),
  );

  // Dropdown del perfil
  showDropdown = false;

  // Barras del progreso del onboarding
  progressBars = Array.from({ length: 32 });
  onboardingProgress = 35;

  // Modo oscuro desde el sidebar móvil
  isDarkMode = false;
  isMobileSidebarClosing = false;

  /**
   * Spinner solo al cambiar de ruta dentro del dashboard (no en la primera carga tras F5
   * ni mientras se cargan recordatorios en segundo plano).
   */
  dashboardRouteLoading = false;

  /** Tras el primer NavigationEnd a /dashboard, las navegaciones siguientes muestran el loader. */
  private initialDashboardNavCompleted = false;

  private routerLoadingSub?: Subscription;

  get showDashboardLoader(): boolean {
    return this.dashboardRouteLoading;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        const u = this.userStorage.user();
        if (requiresBillingChurnLockPage(u)) {
          untracked(() => {
            void this.router.navigate(['/subscribe-required'], {
              replaceUrl: true,
            });
          });
          return;
        }
        if (requiresPaymentFailureSubscribePage(u)) {
          untracked(() => {
            void this.router.navigate(['/subscribe-required'], {
              replaceUrl: true,
              queryParams: { stripe: 'payment_failed' },
            });
          });
        }
      });
      effect((onCleanup) => {
        this.subscriptionPaywallActive();
        untracked(() => {
          const u = this.userStorage.user();
          const needPay = this.subscriptionPaywallActive();
          const churn = requiresBillingChurnLockPage(u);
          const paymentFailure = requiresPaymentFailureSubscribePage(u);
          if (needPay && !churn && !paymentFailure) {
            document.body.style.overflow = 'hidden';
            if (
              !this.matDialog.openDialogs.some(
                (r) => r.id === 'subscription-paywall',
              )
            ) {
              this.modalService.openUpgradePlanPaywall();
            }
          } else {
            document.body.style.removeProperty('overflow');
            this.matDialog.openDialogs
              .find((r) => r.id === 'subscription-paywall')
              ?.close();
          }
        });
        onCleanup(() => {
          document.body.style.removeProperty('overflow');
        });
      });
    }
  }

  async ngOnInit() {
    const user = this.userStorage.user();
    if (
      user &&
      user.hasCompletedSetup !== true &&
      !requiresSubscriptionPaywall(user)
    ) {
      void this.router.navigate(['/company-setup'], { replaceUrl: true });
      return;
    }

    // Lógica que depende de window / documento (solo en navegador)
    if (isPlatformBrowser(this.platformId)) {
      // Inicializar modo oscuro desde localStorage / preferencia del sistema
      const storedTheme = localStorage.getItem('llamalo-theme');
      if (storedTheme === 'dark') {
        this.setDarkMode(true, false);
      } else if (storedTheme === 'light') {
        this.setDarkMode(false, false);
      } else {
        const prefersDark = window.matchMedia?.(
          '(prefers-color-scheme: dark)',
        ).matches;
        this.setDarkMode(prefersDark, false);
      }

      window.addEventListener('openMobileSidebar', () => {
        this.openMobileSidebar();
      });

      // Escuchar evento para abrir el modal de recordatorios desde el sidebar
      window.addEventListener('openReminderModal', () => {
        this.openInactiveReminderModal();
      });

      this.routerLoadingSub = this.router.events.subscribe((e) => {
        if (e instanceof NavigationStart) {
          const path = e.url.split('?')[0];
          if (path.startsWith('/dashboard') && this.initialDashboardNavCompleted) {
            this.dashboardRouteLoading = true;
            this.cdr.markForCheck();
          }
        } else if (
          e instanceof NavigationEnd ||
          e instanceof NavigationCancel ||
          e instanceof NavigationError
        ) {
          if (e instanceof NavigationEnd) {
            const path = e.urlAfterRedirects.split('?')[0];
            if (path.startsWith('/dashboard')) {
              this.initialDashboardNavCompleted = true;
            }
          }
          this.dashboardRouteLoading = false;
          this.cdr.markForCheck();
        }
      });
    }

    // Cargar datos del recordatorio (sin bloquear la UI con el overlay del dashboard)
    await this.loadReminderData();
    this.cdr.markForCheck();

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.maybeStartFirstAgentTour();
      });
    queueMicrotask(() => this.maybeStartFirstAgentTour());
  }

  ngOnDestroy(): void {
    this.routerLoadingSub?.unsubscribe();
  }

  /** Tour guiado (primer agente): spotlight hacia Agentes → Agregar agente. */
  private maybeStartFirstAgentTour(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.subscriptionPaywallActive()) {
      return;
    }
    const url = this.router.url.split('?')[0];
    if (!url.startsWith('/dashboard')) {
      return;
    }
    if (url.includes('/agents/create') || url.includes('/agents/edit')) {
      return;
    }
    this.firstAgentTour.start();
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

  get isNavCollapsed(): boolean {
    if (this.navComponent) {
      this._isNavCollapsed = this.navComponent.isCollapsed;
    }
    return this._isNavCollapsed;
  }

  ngAfterViewInit() {
    this._isNavCollapsed = this.navComponent?.isCollapsed ?? true;
    this.cdr.detectChanges();
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
    this.authSession.signOutAndReload();
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
