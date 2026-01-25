import { computed, inject, PLATFORM_ID } from '@angular/core';
import {
  signalStore,
  withState,
  patchState,
  withMethods,
  withComputed,
  withHooks,
} from '@ngrx/signals';
import { STORAGE_REPOSITORY } from '../storage-repository.token';
import { Store } from '../store.enum';
import type { User } from '../../shared/models/new-user.model';
import { UserService } from '../../core/services/user.service';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { TwilioStorage } from '../twilio/twilio-storage';

type UserState = {
  user: User | null;
  initialized: boolean;
};

const initialState: UserState = {
  user: null,
  initialized: false,
};

export const UserStorage = signalStore(
  { providedIn: 'root' },
  withState<UserState>(() => initialState),

  withMethods((store, storageRepo = inject(STORAGE_REPOSITORY), userService = inject(UserService), platformId = inject(PLATFORM_ID), twilioStorage = inject(TwilioStorage)) => ({
    setUser(user: User) {
      storageRepo.setItem(Store.UserStorage, 'user', user);
      patchState(store, { user });
    },

    clearUser() {
      storageRepo.clearStore(Store.UserStorage);
      patchState(store, { user: null });
    },

    async loadUserProfile(): Promise<void> {
      // Solo cargar si estamos en el navegador y hay un token
      if (!isPlatformBrowser(platformId)) {
        patchState(store, { initialized: true });
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        // Si no hay token, cargar desde localStorage como fallback
        const storedUser = await storageRepo.getItem<User>(
          Store.UserStorage,
          'user'
        );
        patchState(store, { user: storedUser || null });
        patchState(store, { initialized: true });
        return;
      }

      // Si hay token, cargar desde el backend
      try {
        const profile = await firstValueFrom(userService.getUserProfile());
        if (profile) {
          storageRepo.setItem(Store.UserStorage, 'user', profile as User);
          patchState(store, { user: profile as User });
          
          // Actualizar TwilioStorage si viene en el perfil
          if (profile.twilio) {
            twilioStorage.setConfig(profile.twilio);
          }
        }
      } catch (error) {
        console.error('Error al cargar perfil del usuario:', error);
        // En caso de error, cargar desde localStorage como fallback
        const storedUser = await storageRepo.getItem<User>(
          Store.UserStorage,
          'user'
        );
        patchState(store, { user: storedUser || null });
      } finally {
        patchState(store, { initialized: true });
      }
    },
  })),

  withComputed(({ user }) => ({
    hasUser: computed(() => !!user()),
  })),

  withHooks({
    onInit(store, storageRepo = inject(STORAGE_REPOSITORY)) {
      // Cargar desde localStorage primero para mostrar algo rápido
      const userSignal = computed(async () => {
        const storedUser = await storageRepo.getItem<User>(
          Store.UserStorage,
          'user'
        );
        return storedUser || null;
      });

      userSignal().then((user) => {
        patchState(store, { user });
        // No marcar como inicializado aquí, se hará en loadUserProfile
      });
    },
  })
);
