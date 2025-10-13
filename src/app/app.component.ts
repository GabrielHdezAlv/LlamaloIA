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
      // Inicializar Intercom
      this.loadIntercom();
      
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

  private loadIntercom(): void {
    const w = window as any;
    
    // Configurar Intercom
    w.intercomSettings = {
      api_base: "https://api-iam.intercom.io",
      app_id: "tpi8snld",
      hide_default_launcher: false
    };

    // Función de inicialización de Intercom
    const initIntercom = () => {
      const ic = w.Intercom;
      if (typeof ic === "function") {
        ic('reattach_activator');
        ic('update', w.intercomSettings);
      } else {
        const d = document;
        const i: any = function() { i.c(arguments); };
        i.q = [];
        i.c = function(args: any) { i.q.push(args); };
        w.Intercom = i;
        
        const loadScript = () => {
          const s = d.createElement('script');
          s.type = 'text/javascript';
          s.async = true;
          s.src = 'https://widget.intercom.io/widget/tpi8snld';
          const x = d.getElementsByTagName('script')[0];
          if (x && x.parentNode) {
            x.parentNode.insertBefore(s, x);
          }
        };
        
        if (document.readyState === 'complete') {
          loadScript();
        } else if (w.attachEvent) {
          w.attachEvent('onload', loadScript);
        } else {
          w.addEventListener('load', loadScript, false);
        }
      }
    };

    // Ejecutar inmediatamente
    initIntercom();
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


