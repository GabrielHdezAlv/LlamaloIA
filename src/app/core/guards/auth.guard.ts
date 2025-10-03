import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { BetaService } from '../services/beta.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object, // ✅ Inyectamos PLATFORM_ID
    private betaService: BetaService
  ) {}

  canActivate(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      let token: string | null = null;

      if (typeof window !== 'undefined' && window.localStorage) {
        token = localStorage.getItem('token');
      }

      if (!token) {
        this.router.navigate(['/login']);
        return false;
      }

      // Cargar minutos inbound y verificar si debe mostrar la página de beta al recargar
      this.betaService.loadMinutesInbound();
      
      // Pequeño delay para asegurar que los minutos se carguen
      setTimeout(() => {
        if (this.betaService.shouldShowBetaPage) {
          this.router.navigate(['/beta-thanks']);
        }
      }, 500);
    }
    return true;
  }
}
