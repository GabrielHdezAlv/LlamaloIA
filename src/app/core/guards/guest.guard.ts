import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

/**
 * Evita que usuarios ya autenticados accedan a login, registro o recuperación.
 * Redirige al dashboard para mantener una sola sesión activa por navegador (opción estándar).
 */
@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  canActivate(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      let token: string | null = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        token = localStorage.getItem('token');
      }
      if (token) {
        this.router.navigate(['/dashboard']);
        return false;
      }
    }
    return true;
  }
}
