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

  withMethods(
    (
      store,
      storageRepo = inject(STORAGE_REPOSITORY),
      userService = inject(UserService),
      platformId = inject(PLATFORM_ID),
      twilioStorage = inject(TwilioStorage),
    ) => ({
      cleanBlobUrls(user: User): User {
        if (!user) return user;

        // Si profileImage es una blob URL, limpiarla completamente
        if (user.profileImage && user.profileImage.startsWith('blob:')) {
          return {
            ...user,
            profileImage: '', // Eliminar blob URL completamente
          };
        }

        return user;
      },

      setUser(user: User) {
        // Limpiar blob URLs antes de guardar para evitar errores de seguridad
        const cleanUser = this.cleanBlobUrls(user);
        storageRepo.setItem(Store.UserStorage, 'user', cleanUser);
        patchState(store, { user: cleanUser });
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
            'user',
          );
          const cleanUser = storedUser ? this.cleanBlobUrls(storedUser) : null;
          patchState(store, { user: cleanUser });
          patchState(store, { initialized: true });
          return;
        }

        // Si hay token, cargar desde el backend
        try {
          const profile = await firstValueFrom(userService.getUserProfile());
          if (profile) {
            // Normalizar enterprise: si no existe, usar valores por defecto
            const normalizedProfile = {
              ...profile,
              enterprise: profile.enterprise || { name: '', url: '' },
            } as User;

            // Limpiar blob URLs antes de guardar
            const cleanProfile = this.cleanBlobUrls(normalizedProfile);

            storageRepo.setItem(Store.UserStorage, 'user', cleanProfile);
            patchState(store, { user: cleanProfile });

            // Actualizar TwilioStorage si viene en el perfil
            // Usar la primera cuenta de Twilio para compatibilidad con el storage actual
            if (
              profile.twilio &&
              Array.isArray(profile.twilio) &&
              profile.twilio.length > 0
            ) {
              const firstAccount = profile.twilio[0];
              twilioStorage.setConfig({
                twilioAccountId: firstAccount.twilioAccountId,
                twilioSid: firstAccount.twilioSid,
                twilioToken: firstAccount.twilioToken,
              });
            }
          }
        } catch (error) {
          console.error('Error al cargar perfil del usuario:', error);
          // En caso de error, cargar desde localStorage como fallback
          const storedUser = await storageRepo.getItem<User>(
            Store.UserStorage,
            'user',
          );
          const cleanUser = storedUser ? this.cleanBlobUrls(storedUser) : null;
          patchState(store, { user: cleanUser });
        } finally {
          patchState(store, { initialized: true });
        }
      },
    }),
  ),

  withComputed(({ user }) => ({
    hasUser: computed(() => !!user()),
  })),

  withHooks({
    onInit(store, storageRepo = inject(STORAGE_REPOSITORY)) {
      // Cargar desde localStorage primero para mostrar algo rápido
      const userSignal = computed(async () => {
        const storedUser = await storageRepo.getItem<User>(
          Store.UserStorage,
          'user',
        );
        return storedUser || null;
      });

      userSignal().then((user) => {
        patchState(store, { user });
        // No marcar como inicializado aquí, se hará en loadUserProfile
      });
    },
  }),
);
