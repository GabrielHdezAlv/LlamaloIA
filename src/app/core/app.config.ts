import { ApplicationConfig, PLATFORM_ID, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { STORAGE_REPOSITORY } from '../storages/storage-repository.token';
import { LocalStorageRepository } from '../storages/local-storage.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    {
      provide: STORAGE_REPOSITORY,
      useClass: LocalStorageRepository,
    },
  ],
};
