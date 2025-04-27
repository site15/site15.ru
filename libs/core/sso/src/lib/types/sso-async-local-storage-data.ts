import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export type SsoAsyncLocalStorageData = {
  authTimezone?: number;
};

@Injectable()
export class SsoAsyncLocalStorageContext {
  private storage: AsyncLocalStorage<SsoAsyncLocalStorageData>;

  constructor() {
    this.storage = new AsyncLocalStorage();
  }

  get() {
    return this.storage.getStore() as SsoAsyncLocalStorageData;
  }

  runWith<T = void>(context: SsoAsyncLocalStorageData, cb: () => T) {
    return this.storage.run(context, cb);
  }
}
