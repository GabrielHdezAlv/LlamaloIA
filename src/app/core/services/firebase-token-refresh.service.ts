import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firebaseAuth } from './firebase.config';
import { environment } from '../../../environments/environment';

/** Clave en localStorage para renovar el ID token (login email/contraseña vía REST). */
export const FIREBASE_REFRESH_TOKEN_STORAGE_KEY = 'firebase_refresh_token';

/** Intervalo de renovación: mantiene la sesión activa más allá de la caducidad del ID token (~1 h). */
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Renueva periódicamente el ID token de Firebase guardado en localStorage:
 * - Con refresh token (REST) tras login/registro email/contraseña.
 * - Con getIdToken(true) si hay sesión del SDK (p. ej. Google).
 */
@Injectable({
  providedIn: 'root',
})
export class FirebaseTokenRefreshService {
  private platformId = inject(PLATFORM_ID);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  /** Inicia el temporizador (solo navegador). Idempotente. */
  start(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      void this.refreshNow();
    }, REFRESH_INTERVAL_MS);
    queueMicrotask(() => void this.refreshNow());
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Guarda token y refresh token devueltos por el backend tras login/registro.
   */
  persistSessionTokensFromApi(response: {
    token?: string;
    refreshToken?: string;
  }): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof window === 'undefined' || !window.localStorage) return;
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    if (response.refreshToken) {
      localStorage.setItem(
        FIREBASE_REFRESH_TOKEN_STORAGE_KEY,
        response.refreshToken,
      );
    }
  }

  async refreshNow(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof window === 'undefined' || !window.localStorage) return;

    const refreshToken = localStorage.getItem(
      FIREBASE_REFRESH_TOKEN_STORAGE_KEY,
    );
    if (refreshToken) {
      await this.refreshIdTokenWithRest(refreshToken);
      return;
    }

    const user = firebaseAuth.currentUser;
    if (user) {
      try {
        const idToken = await user.getIdToken(true);
        localStorage.setItem('token', idToken);
      } catch {
        // Sesión SDK inválida; no limpiamos aquí (el 401 global lo hará).
      }
    }
  }

  private async refreshIdTokenWithRest(refreshToken: string): Promise<void> {
    const apiKey = environment.firebase?.apiKey;
    if (!apiKey) return;

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    try {
      const res = await fetch(
        `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        },
      );

      if (!res.ok) {
        return;
      }

      const data = (await res.json()) as {
        id_token?: string;
        refresh_token?: string;
      };

      if (data.id_token) {
        localStorage.setItem('token', data.id_token);
      }
      if (data.refresh_token) {
        localStorage.setItem(
          FIREBASE_REFRESH_TOKEN_STORAGE_KEY,
          data.refresh_token,
        );
      }
    } catch {
      // Red o error puntual; siguiente intervalo reintenta.
    }
  }
}
