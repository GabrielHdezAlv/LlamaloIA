const STORAGE_KEY = 'llamalo_device_id';

/** Identificador estable por navegador para verificación de dispositivos nuevos. */
export function getOrCreateDeviceId(): string {
  if (typeof localStorage === 'undefined') {
    return '';
  }
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
