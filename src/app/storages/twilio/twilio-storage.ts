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
import { Store } from '../store.enum';
import type { TwilioConfig } from '../../shared/models/twilio-config.model';

type TwilioState = {
  config: TwilioConfig | null;
  initialized: boolean;
};

const initialState: TwilioState = {
  config: null,
  initialized: false,
};

export const TwilioStorage = signalStore(
  { providedIn: 'root' },
  withState<TwilioState>(() => initialState),

  withMethods((store, storageRepo = inject(STORAGE_REPOSITORY)) => ({
    setConfig(config: TwilioConfig) {
      storageRepo.setItem(Store.TwilioStorage, 'config', config);
      patchState(store, { config });
    },

    clearConfig() {
      storageRepo.clearStore(Store.TwilioStorage);
      patchState(store, { config: null });
    },
  })),

  withComputed(({ config }) => ({
    hasConfig: computed(() => !!config()),
  })),

  withHooks({
    onInit(store, storageRepo = inject(STORAGE_REPOSITORY)) {
      const configSignal = computed(async () => {
        const storedConfig = await storageRepo.getItem<TwilioConfig>(
          Store.TwilioStorage,
          'config'
        );
        return storedConfig || null;
      });

      configSignal().then((config) => {
        patchState(store, { config });
        patchState(store, { initialized: true });
      });
    },
  })
);
