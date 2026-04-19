import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  Router,
  type CanActivate,
  type UrlTree,
} from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

/**
 * Rutas solo para sesión iniciada.
 * En SSR no hay token en localStorage: redirigir a /login haría que un F5 en el dashboard
 * pinte primero login y luego hidrate al destino; por eso en servidor se permite la ruta
 * y la comprobación del token solo aplica en el navegador.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  canActivate(): boolean | UrlTree {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    let token: string | null = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('token');
    }

    if (!token) {
      return this.router.parseUrl('/login');
    }

    return true;
  }
}
