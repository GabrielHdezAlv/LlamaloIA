// src/app/shared/storage/local-storage.repository.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StorageRepository } from './storage-repository.interface';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageRepository implements StorageRepository {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  async getItem<T>(store: string, key: string): Promise<T | null> {
    if (!this.isBrowser) {
      return null;
    }
    let data: string | null = null;

    if (typeof window !== 'undefined' && window.localStorage) {
      data = localStorage.getItem(`${store}.${key}`);
    }

    return data ? (JSON.parse(data) as T) : null;
  }

  async setItem<T>(store: string, key: string, value: T): Promise<void> {
    if (!this.isBrowser) {
      return;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      // Limpiar blob URLs antes de guardar para evitar errores de seguridad
      const cleanValue = this.cleanBlobUrls(value);
      localStorage.setItem(`${store}.${key}`, JSON.stringify(cleanValue));
    }
  }

  private cleanBlobUrls<T>(value: T): T {
    if (!value || typeof value !== 'object') {
      return value;
    }

    // Si es un objeto User, limpiar profileImage
    if ('profileImage' in value && typeof value.profileImage === 'string') {
      const user = value as any;
      if (user.profileImage && user.profileImage.startsWith('blob:')) {
        return { ...user, profileImage: '' };
      }
    }

    return value;
  }

  async clearKey(store: string, key: string): Promise<void> {
    if (!this.isBrowser) {
      return;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(`${store}.${key}`);
    }
  }

  async clearStore(store: string): Promise<void> {
    if (!this.isBrowser) {
      return;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(`${store}.`))
        .forEach((k) => localStorage.removeItem(k));
    }
  }
}
