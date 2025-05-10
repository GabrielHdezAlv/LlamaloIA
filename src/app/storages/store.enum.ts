export enum Store {
  UserStorage = 'UserStorage',
  TwilioStorage = 'TwilioStorage',
}

export type StoreKey<T extends Store> = string;
