import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  patchState,
  withMethods,
  withComputed,
  withHooks,
} from '@ngrx/signals';
import { STORAGE_REPOSITORY } from '../storage-repository.token';
import type { StorageRepository } from '../storage-repository.interface';
import { Store } from '../store.enum';
import type { User } from '../../shared/models/new-user.model';

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

  withMethods((store, storageRepo = inject(STORAGE_REPOSITORY)) => ({
    setUser(user: User) {
      storageRepo.setItem(Store.UserStorage, 'user', user);
      patchState(store, { user });
    },

    clearUser() {
      storageRepo.clearStore(Store.UserStorage);
      patchState(store, { user: null });
    },
  })),

  withComputed(({ user }) => ({
    hasUser: computed(() => !!user()),
  })),

  withHooks({
    onInit(store, storageRepo = inject(STORAGE_REPOSITORY)) {
      const userSignal = computed(async () => {
        const storedUser = await storageRepo.getItem<User>(
          Store.UserStorage,
          'user'
        );
        return storedUser || null;
      });

      userSignal().then((user) => {
        patchState(store, { user });
        patchState(store, { initialized: true });
      });
    },
  })
);
