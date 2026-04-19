import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { allowsAuthRegistrationAndGoogle } from '../utils/auth-host-features';

/**
 * La ruta `/register` solo en localhost o builds dev/preprod; en producción redirige a login.
 */
@Injectable({
  providedIn: 'root',
})
export class RegisterLocalhostGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  canActivate(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      // Sin host del navegador no se puede ofrecer registro; evita prerender de `/register` en despliegue.
      return false;
    }
    if (!allowsAuthRegistrationAndGoogle()) {
      void this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
