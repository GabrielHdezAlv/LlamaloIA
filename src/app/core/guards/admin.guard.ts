import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import {
  Router,
  type CanActivate,
  type UrlTree,
} from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { UserStorage } from '../../storages/user/user-storage';
import { USER_ROLE } from '../../shared/models/user-role.enum';
import { UserService } from '../services/user.service';

/**
 * Panel admin: solo `owner`, con rol refrescado desde la API (no solo memoria local).
 */
@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  private userStorage = inject(UserStorage);
  private userService = inject(UserService);

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
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

    try {
      await firstValueFrom(this.userService.getUserProfile());
    } catch {
      return this.router.parseUrl('/login');
    }

    const user = this.userStorage.user();
    if (!user || user.rol !== USER_ROLE.OWNER) {
      return this.router.parseUrl('/forbidden');
    }

    return true;
  }
}
