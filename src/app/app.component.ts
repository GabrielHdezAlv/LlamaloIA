import { Component, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { RouteVisibilityService } from './core/services/route-visibility.service';
import { FirebaseTokenRefreshService } from './core/services/firebase-token-refresh.service';
import { SupportWidgetComponent } from './shared/components/support-widget/support-widget.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SupportWidgetComponent, SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'llamaloIO';
  isAtBottom = false;
  isGlobalLoading = false;

  private router = inject(Router);
  private routeVisibilityService = inject(RouteVisibilityService);
  private firebaseTokenRefresh = inject(FirebaseTokenRefreshService);

  constructor(@Inject(PLATFORM_ID) private platformId: object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.firebaseTokenRefresh.start();

      // Interceptar TODA la navegación para mantener la URL limpia
      this.interceptAllNavigation();

      // Escuchar cambios de ruta y limpiar inmediatamente solo en modo prod
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          // Solo limpiar la URL si estamos en modo prod (rutas ocultas)
          if (!this.routeVisibilityService.getCurrentState()) {
            setTimeout(() => {
              this.cleanUrl();
            }, 0);
          }
        });

      // Configurar detección de scroll para mostrar el footer
      this.setupScrollDetection();

      // Escuchar eventos globales de carga (por ejemplo, inicio de sesión)
      window.addEventListener('global-loading', (event: Event) => {
        const custom = event as CustomEvent<boolean>;
        this.isGlobalLoading = !!custom.detail;
      });
    }
  }

  private setupScrollDetection(): void {
    const checkScroll = () => {
      // Verificar si estamos en la página de métricas - no mostrar el footer ahí
      const currentUrl = this.router.url;
      if (currentUrl.includes('/metrics')) {
        this.isAtBottom = false;
        return;
      }

      const windowHeight = window.innerHeight;
      // Verificar tanto documentElement como body para mayor compatibilidad
      const docElement = document.documentElement;
      const body = document.body;

      // Obtener la altura real del documento
      const documentHeight = Math.max(
        docElement.scrollHeight,
        body.scrollHeight,
        docElement.offsetHeight,
        body.offsetHeight
      );

      const scrollTop = Math.max(
        window.pageYOffset || 0,
        docElement.scrollTop || 0,
        body.scrollTop || 0
      );

      // Verificar si hay scroll disponible
      // Usamos un margen más estricto para detectar si realmente hay scroll
      const hasScroll = documentHeight > windowHeight + 10;

      if (!hasScroll) {
        // Si no hay scroll, mostrar el texto (el contenido cabe en la pantalla)
        this.isAtBottom = true;
      } else {
        // Si hay scroll, solo mostrarlo cuando estemos realmente al final
        // Usamos un threshold más pequeño para ser más preciso
        const threshold = 80;
        const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
        this.isAtBottom = distanceFromBottom <= threshold;
      }
    };

    // Verificar al cargar (con un delay para asegurar que el DOM está listo)
    const initialCheck = () => {
      // Primero ocultar el texto
      this.isAtBottom = false;

      // Luego verificar después de que el DOM esté listo
      setTimeout(() => {
        checkScroll();
      }, 300);
    };

    initialCheck();

    // Verificar al hacer scroll
    window.addEventListener('scroll', checkScroll, { passive: true });

    // Verificar al cambiar el tamaño de la ventana
    window.addEventListener('resize', checkScroll, { passive: true });

    // Verificar cuando cambia la ruta (nueva página cargada)
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Ocultar primero
        this.isAtBottom = false;
        setTimeout(() => {
          checkScroll();
        }, 400);
      });
  }


  private interceptAllNavigation(): void {
    // Interceptar pushState
    const originalPushState = history.pushState;
    history.pushState = (state, title, url) => {
      // Solo limpiar la URL si estamos en modo prod (rutas ocultas)
      if (!this.routeVisibilityService.getCurrentState()) {
        originalPushState.call(history, state, title, window.location.origin);
      } else {
        originalPushState.call(history, state, title, url);
      }
    };

    // Interceptar replaceState
    const originalReplaceState = history.replaceState;
    history.replaceState = (state, title, url) => {
      // Solo limpiar la URL si estamos en modo prod (rutas ocultas)
      if (!this.routeVisibilityService.getCurrentState()) {
        originalReplaceState.call(history, state, title, window.location.origin);
      } else {
        originalReplaceState.call(history, state, title, url);
      }
    };

    // Interceptar popstate (botones atrás/adelante)
    window.addEventListener('popstate', () => {
      // Solo limpiar la URL si estamos en modo prod (rutas ocultas)
      if (!this.routeVisibilityService.getCurrentState()) {
        this.cleanUrl();
      }
    });
  }

  private cleanUrl(): void {
    const cleanUrl = window.location.origin;
    if (window.location.href !== cleanUrl) {
      window.history.replaceState({}, '', cleanUrl);
    }
  }
}


