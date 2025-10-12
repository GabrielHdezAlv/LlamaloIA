import { Component, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { RouteVisibilityService } from './core/services/route-visibility.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'llamaloIO';
  
  private router = inject(Router);
  private routeVisibilityService = inject(RouteVisibilityService);
  
  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
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
    }
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


