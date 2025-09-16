import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private currentRoute = 'home';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  /**
   * Navega a una ruta sin cambiar la URL visible
   */
  navigateToRoute(route: string): void {
    if (isPlatformBrowser(this.platformId)) {
      this.currentRoute = route;
      
      // Navegar internamente usando el router
      this.router.navigate([`/dashboard/${route}`], { skipLocationChange: true });
      
      // Limpiar la URL inmediatamente
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.origin);
      }, 0);
    }
  }

  /**
   * Obtiene la ruta actual
   */
  getCurrentRoute(): string {
    return this.currentRoute;
  }

  /**
   * Navega al dashboard home
   */
  goToHome(): void {
    this.navigateToRoute('home');
  }

  /**
   * Navega a agentes
   */
  goToAgents(): void {
    this.navigateToRoute('agents');
  }

  /**
   * Navega a números
   */
  goToNumbers(): void {
    this.navigateToRoute('numbers');
  }

  /**
   * Navega al historial
   */
  goToHistory(): void {
    this.navigateToRoute('history');
  }

  /**
   * Navega a métricas
   */
  goToMetrics(): void {
    this.navigateToRoute('metrics');
  }

  /**
   * Navega a cuenta
   */
  goToAccount(): void {
    this.navigateToRoute('account');
  }
}
