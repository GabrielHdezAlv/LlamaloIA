import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  Router,
  type CanActivate,
  type UrlTree,
} from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

/**
 * Rutas solo para sesión iniciada. En SSR sin token no se entrega el shell del dashboard.
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
      return this.router.parseUrl('/login');
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
