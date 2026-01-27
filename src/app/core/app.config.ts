import { ApplicationConfig, PLATFORM_ID, inject, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { STORAGE_REPOSITORY } from '../storages/storage-repository.token';
import { LocalStorageRepository } from '../storages/local-storage.repository';
import { ModalService } from '../shared/modals/modal.service';
import { UserStorage } from '../storages/user/user-storage';
import { authInterceptor } from './interceptors/auth.interceptor';

class GlobalErrorHandler implements ErrorHandler {
  private modalService = inject(ModalService);

  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    const details = error instanceof Error && error.stack ? error.stack : undefined;
    this.modalService.openError({
      title: 'Error de aplicación',
      message,
      details,
    });
    console.error(error);
  }
}

// Función para inicializar y cargar el perfil del usuario
export function initializeUserProfile(userStorage: InstanceType<typeof UserStorage>): () => Promise<void> {
  return () => userStorage.loadUserProfile();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    {
      provide: STORAGE_REPOSITORY,
      useClass: LocalStorageRepository,
    },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeUserProfile,
      deps: [UserStorage],
      multi: true,
    },
  ],
};
