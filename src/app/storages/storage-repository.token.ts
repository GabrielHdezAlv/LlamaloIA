// src/app/shared/storage/storage-repository.token.ts
import { InjectionToken } from '@angular/core';
import type { StorageRepository } from './storage-repository.interface';

export const STORAGE_REPOSITORY = new InjectionToken<StorageRepository>(
  'StorageRepository'
);
