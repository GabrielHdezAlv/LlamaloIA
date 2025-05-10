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
    const data = localStorage.getItem(`${store}.${key}`);
    return data ? (JSON.parse(data) as T) : null;
  }

  async setItem<T>(store: string, key: string, value: T): Promise<void> {
    if (!this.isBrowser) {
      return;
    }
    localStorage.setItem(`${store}.${key}`, JSON.stringify(value));
  }

  async clearKey(store: string, key: string): Promise<void> {
    if (!this.isBrowser) {
      return;
    }
    localStorage.removeItem(`${store}.${key}`);
  }

  async clearStore(store: string): Promise<void> {
    if (!this.isBrowser) {
      return;
    }
    Object.keys(localStorage)
      .filter((k) => k.startsWith(`${store}.`))
      .forEach((k) => localStorage.removeItem(k));
  }
}
