import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { UserStorage } from '../../storages/user/user-storage';
import { USER_ROLE } from '../../shared/models/user-role.enum';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  private userStorage = inject(UserStorage);

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

      // Verificar autenticación básica
      if (!token) {
        this.router.navigate(['/login']);
        return false;
      }

      // Verificar rol de owner
      const user = this.userStorage.user();
      if (!user || user.rol !== USER_ROLE.OWNER) {
        this.router.navigate(['/dashboard']);
        return false;
      }
    }

    return true;
  }
}
