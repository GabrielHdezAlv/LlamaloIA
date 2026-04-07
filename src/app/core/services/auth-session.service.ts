import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from './firebase.config';
import { UserStorage } from '../../storages/user/user-storage';
import { TwilioStorage } from '../../storages/twilio/twilio-storage';
import {
  FirebaseTokenRefreshService,
  FIREBASE_REFRESH_TOKEN_STORAGE_KEY,
} from './firebase-token-refresh.service';

/**
 * Limpieza unificada de sesión (JWT, Firebase, perfil en memoria, Twilio local).
 */
@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  private userStorage = inject(UserStorage);
  private twilioStorage = inject(TwilioStorage);
  private platformId = inject(PLATFORM_ID);
  private tokenRefresh = inject(FirebaseTokenRefreshService);

  async clearSession(): Promise<void> {
    this.tokenRefresh.stop();
    if (isPlatformBrowser(this.platformId)) {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('token');
        localStorage.removeItem(FIREBASE_REFRESH_TOKEN_STORAGE_KEY);
      }
      try {
        await signOut(firebaseAuth);
      } catch {
        // Sesión Firebase ya cerrada o no aplicable
      }
    }
    this.userStorage.clearUser();
    this.twilioStorage.clearConfig();
  }

  /** Cierre de sesión explícito: recarga la app en /login para vaciar estado en memoria. */
  signOutAndReload(): void {
    void this.clearSession().then(() => {
      if (isPlatformBrowser(this.platformId)) {
        window.location.assign('/login');
      }
    });
  }
}
