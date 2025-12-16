import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  canActivate(): boolean {
    // Por ahora permite a cualquiera, pero la estructura está lista
    // para agregar validaciones de rol de admin en el futuro
    if (isPlatformBrowser(this.platformId)) {
      let token: string | null = null;

      if (typeof window !== 'undefined' && window.localStorage) {
        token = localStorage.getItem('token');
      }

      // Verificar autenticación básica
      if (!token) {
        this.router.navigate(['/login']);
        return false;
      }

      // TODO: Aquí se puede agregar validación de rol de admin
      // Por ejemplo:
      // const user = this.userStorage.user();
      // if (user?.role !== 'admin') {
      //   this.router.navigate(['/dashboard']);
      //   return false;
      // }
    }
    
    // Por ahora permite el acceso
    return true;
  }
}

