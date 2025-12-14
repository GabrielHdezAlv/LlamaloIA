// src/app/components/sidebar/sidebar.component.ts
import { Component, HostListener, computed, inject, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserStorage } from '../../storages/user/user-storage';
import { NavigationService } from '../../core/services/navigation.service';
import { I18nService, Language } from '../../core/services/i18n.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnDestroy, OnInit {
  isOpen: boolean = false;
  isClosing: boolean = false;
  isCollapsed: boolean = true;
  windowWidth: number = 0;
  isHovering: boolean = false;
  private hoverTimer: any;
  // Barras del progreso del onboarding (todas azules y mismas dimensiones)
  progressBars = Array.from({ length: 32 });
  // Porcentaje de progreso (0 - 100). Ajusta según datos reales.
  onboardingProgress = 35;

  // Inyectar UserStorage, Router y NavigationService
  // DESPUÉS (público para que el template pueda acceder)
  public userStorage = inject(UserStorage);
  private router = inject(Router);
  private navigationService = inject(NavigationService);
  private i18nService = inject(I18nService);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Propiedad computada para obtener el nombre completo del usuario
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

  // Idiomas usando el servicio de i18n
  languages = this.i18nService.getAvailableLanguages();
  showLanguageMenu = false;

  // Obtener el idioma seleccionado usando el método del servicio
  get selectedLanguage() {
    return this.i18nService.selectedLanguage();
  }

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  ngOnInit() {
    this.onResize();
    this.i18nService.initializeLanguage();
  }

  openMenu() {
    this.isOpen = true;
  }

  closeMenu() {
    if (this.isClosing) return; // Evitar múltiples cierres simultáneos
    
    this.isClosing = true;
    
    // Esperar a que termine la animación de salida (400ms)
    setTimeout(() => {
      this.isOpen = false;
      this.isClosing = false;
    }, 400);
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Expandir al pasar el ratón por encima
  expandOnHover() {
    if (this.isCollapsed) {
      this.isCollapsed = false;
    }
    // Activar hover para la animación de la imagen
    this.isHovering = true;
    this.startHoverTimer();
    // Forzar recalculo de layout para componentes que dependen del ancho (gráficos)
    this.triggerResizeAfterTransition();
  }

  // Colapsar al salir del ratón
  collapseOnLeave() {
    if (!this.isCollapsed) {
      this.isCollapsed = true;
    }
    // Desactivar hover inmediatamente
    this.isHovering = false;
    this.clearHoverTimer();
    // Forzar recalculo de layout para componentes que dependen del ancho (gráficos)
    this.triggerResizeAfterTransition();
  }

  // Iniciar timer para que la imagen vuelva a aparecer
  private startHoverTimer() {
    this.clearHoverTimer();
    this.hoverTimer = setTimeout(() => {
      this.isHovering = false;
    }, 1000); // 1 segundo
  }

  // Limpiar timer
  private clearHoverTimer() {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
  }

  // Dispara eventos de resize para que librerías como ApexCharts re-rendericen tras el cambio de ancho
  private triggerResizeAfterTransition() {
    if (!this.isBrowser) return;
    const width = window.innerWidth;
    // Solo aplicar entre 1024px y 1439px (rango laptop)
    if (width < 1024 || width > 1439) return;
    // Debounce: un único evento tras finalizar la transición (≈500ms según estilos)
    if ((window as any).__llamaloResizeTimer) {
      clearTimeout((window as any).__llamaloResizeTimer);
    }
    (window as any).__llamaloResizeTimer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      (window as any).__llamaloResizeTimer = null;
    }, 420);
  }

  selectLanguage(lang: Language) {
    this.i18nService.setLanguage(lang);
    this.showLanguageMenu = false;
  }

  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      this.windowWidth = window.innerWidth;
      // En pantallas grandes, el sidebar está siempre abierto
      this.isOpen = this.windowWidth >= 1280;
    }
  }

  // Método para verificar si una ruta está activa
  isRouteActive(route: string): boolean {
    const currentUrl = this.router.url;

    // Caso especial: /dashboard/agents o /dashboard/agents/create → resaltar "Agentes"
    if (route === '/dashboard/agents') {
      return (
        currentUrl === '/dashboard/agents' ||
        currentUrl === '/dashboard/agents/create'
      );
    }

    // Para la ruta de inicio, también activar cuando esté en /dashboard sin nada más
    if (route === '/dashboard/home') {
      return currentUrl === '/dashboard/home' || currentUrl === '/dashboard';
    }

    // Para otras rutas, verificar coincidencia exacta
    return currentUrl === route;
  }

  // En el componente
  showDropdown = false;

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
  }

  // Ir a la sección de regalos en account
  goToGifts() {
    this.router.navigate(['/dashboard/account'], {
      queryParams: { tab: 'gifts' },
    });
    this.showDropdown = false;
  }

  // Navegar específicamente a la sección de regalos en account
  navigateToAccountGifts() {
    // Usar el servicio de navegación para ir a account
    this.navigationService.navigateToRoute('account');
    
    // Esperar un momento y luego activar la pestaña de regalos
    setTimeout(() => {
      // Buscar el botón de regalos y hacer clic en él
      const giftsButton = document.querySelector('[data-tab="gifts"]') as HTMLElement;
      if (giftsButton) {
        giftsButton.click();
      } else {
        // Si no encuentra el botón por data-tab, buscar por texto
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
          if (button.textContent?.includes('Regalos') || button.textContent?.includes('Gifts')) {
            button.click();
          }
        });
      }
      }, 10);
  }

  // Abrir sidebar móvil
  openMobileSidebar() {
    // Disparar evento personalizado para abrir el sidebar móvil (solo en navegador)
    if (this.isBrowser) {
      const event = new CustomEvent('openMobileSidebar');
      window.dispatchEvent(event);
    }
  }

  // Cerrar sesión
  logout() {
    // Limpiar datos de usuario
    this.userStorage.clearUser();
    
    this.router.navigate(['/login']);
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
    // Hue fijo en 220 (azul), se reduce la luminosidad progresivamente
    const lightStart = 48; // azul brillante
    const lightEnd = 14;   // casi negro
    const lightness = lightStart + ((index / Math.max(total - 1, 1)) * (lightEnd - lightStart));

    return { background: `hsl(220, 90%, ${lightness}%)` };
  }

  // Limpiar timer al destruir el componente
  ngOnDestroy() {
    this.clearHoverTimer();
  }
}
