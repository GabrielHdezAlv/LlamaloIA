import { Component, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'llamaloIO';
  
  private router = inject(Router);
  
  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Interceptar TODA la navegación para mantener la URL limpia
      this.interceptAllNavigation();
      
      // Escuchar cambios de ruta y limpiar inmediatamente
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          // Limpiar la URL inmediatamente después de cualquier navegación
          setTimeout(() => {
            this.cleanUrl();
          }, 0);
        });
    }
  }

  private interceptAllNavigation(): void {
    // Interceptar pushState
    const originalPushState = history.pushState;
    history.pushState = (state, title, url) => {
      originalPushState.call(history, state, title, window.location.origin);
    };

    // Interceptar replaceState
    const originalReplaceState = history.replaceState;
    history.replaceState = (state, title, url) => {
      originalReplaceState.call(history, state, title, window.location.origin);
    };

    // Interceptar popstate (botones atrás/adelante)
    window.addEventListener('popstate', () => {
      this.cleanUrl();
    });
  }

  private cleanUrl(): void {
    const cleanUrl = window.location.origin;
    if (window.location.href !== cleanUrl) {
      window.history.replaceState({}, '', cleanUrl);
    }
  }
}


