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
  isAtBottom = false;
  
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
      
      // Configurar detección de scroll para mostrar el footer
      this.setupScrollDetection();
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


