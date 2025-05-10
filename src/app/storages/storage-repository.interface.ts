export interface StorageRepository {
  setItem<T>(store: string, key: string, value: T): Promise<void>;
  getItem<T>(store: string, key: string): Promise<T | null>;
  clearKey(store: string, key: string): Promise<void>;
  clearStore(store: string): Promise<void>;
}
