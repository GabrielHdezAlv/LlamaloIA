import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserStorage } from '../../storages/user/user-storage';
import { UserService } from './user.service';

/**
 * WebSocket /profile/events: el backend empuja `profile_updated` al cambiar plan, cupo, etc.
 * Recarga el perfil en todas las pestañas con sesión.
 */
@Injectable({
  providedIn: 'root',
})
export class ProfileEventsClientService {
  private readonly userService = inject(UserService);
  private readonly userStorage = inject(UserStorage);
  private readonly platformId = inject(PLATFORM_ID);

  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly reconnectDelayMs = 8000;

  private buildWsUrl(): string {
    const base = this.userService.getApiBaseUrl().replace(/\/$/, '');
    if (base.startsWith('https://')) {
      return `wss://${base.slice(8)}/profile/events`;
    }
    if (base.startsWith('http://')) {
      return `ws://${base.slice(7)}/profile/events`;
    }
    return `${base}/profile/events`;
  }

  /** Conecta si hay token; cierra conexión previa. */
  connectIfLoggedIn(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof window === 'undefined' || !window.localStorage) return;

    const token = localStorage.getItem('token');
    if (!token) {
      this.disconnect();
      return;
    }

    this.disconnect(false);

    let url: string;
    try {
      url = this.buildWsUrl();
    } catch {
      return;
    }

    try {
      this.ws = new WebSocket(url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      try {
        this.ws?.send(JSON.stringify({ type: 'auth', token }));
      } catch {
        this.ws?.close();
      }
    };

    this.ws.onmessage = (ev: MessageEvent<string>) => {
      try {
        const data = JSON.parse(ev.data) as { type?: string };
        if (data.type === 'profile_updated') {
          void this.userStorage.loadUserProfile();
        }
      } catch {
        /* ignore */
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      if (localStorage.getItem('token')) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      try {
        this.ws?.close();
      } catch {
        /* ignore */
      }
    };
  }

  disconnect(clearReconnect = true): void {
    if (clearReconnect && this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.onclose = null;
        this.ws.close();
      } catch {
        /* ignore */
      }
      this.ws = null;
    }
  }

  private scheduleReconnect(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.reconnectTimer) return;
    if (!localStorage.getItem('token')) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectIfLoggedIn();
    }, this.reconnectDelayMs);
  }
}
