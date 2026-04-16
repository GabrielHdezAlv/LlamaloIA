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
import { ProfileEventsClientService } from './profile-events-client.service';
import {
  FIRST_AGENT_TOUR_SESSION_KEY,
  FIRST_AGENT_TOUR_HOME_READY_KEY,
  PLAN_CELEBRATION_REQUIRED_KEY,
  PLAN_CELEBRATION_ACCEPTED_KEY,
  POST_ONBOARDING_DASHBOARD_CELEBRATION_KEY,
} from '../constants/first-agent-tour.constants';

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
  private profileEventsClient = inject(ProfileEventsClientService);

  async clearSession(): Promise<void> {
    this.profileEventsClient.disconnect();
    this.tokenRefresh.stop();
    if (isPlatformBrowser(this.platformId)) {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('token');
        localStorage.removeItem(FIREBASE_REFRESH_TOKEN_STORAGE_KEY);
      }
      try {
        sessionStorage.removeItem(FIRST_AGENT_TOUR_SESSION_KEY);
        sessionStorage.removeItem(FIRST_AGENT_TOUR_HOME_READY_KEY);
        sessionStorage.removeItem(PLAN_CELEBRATION_REQUIRED_KEY);
        sessionStorage.removeItem(PLAN_CELEBRATION_ACCEPTED_KEY);
        sessionStorage.removeItem(POST_ONBOARDING_DASHBOARD_CELEBRATION_KEY);
      } catch {
        /* ignore */
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
