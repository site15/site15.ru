import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { isObservable, Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { SsoCacheService } from '../services/sso-cache.service';
import { SsoTimezoneService, TData } from '../services/sso-timezone.service';
import { SsoAsyncLocalStorageContext } from '../types/sso-async-local-storage-data';
import { SsoRequest } from '../types/sso-request';

@Injectable()
export class SsoTimezoneInterceptor implements NestInterceptor<TData, TData> {
  constructor(
    private readonly authTimezoneService: SsoTimezoneService,
    private readonly ssoCacheService: SsoCacheService,
    private readonly asyncLocalStorage: SsoAsyncLocalStorageContext
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const req: SsoRequest = getRequestFromExecutionContext(context);
    const userId = req.ssoUser?.id;

    if (!userId) {
      return next.handle();
    }
    const store = { authTimezone: req.ssoUser?.timezone || 0 };
    const wrapObservableForWorkWithAsyncLocalStorage = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      observable: Observable<any>
    ) =>
      new Observable((observer) => {
        this.asyncLocalStorage.runWith(store, () => {
          observable.subscribe({
            next: (res) => observer.next(res),
            error: (error) => observer.error(error),
            complete: () => observer.complete(),
          });
        });
      });

    const run = () => {
      const result = this.asyncLocalStorage.runWith(store, () => next.handle());

      if (isObservable(result)) {
        return wrapObservableForWorkWithAsyncLocalStorage(result).pipe(
          concatMap(async (data) => {
            const user = await this.ssoCacheService.getCachedUser({ userId });
            const newData = this.authTimezoneService.convertObject(
              data,
              user?.timezone
            );

            return newData;
          })
        );
      }
      if (result instanceof Promise && typeof result?.then === 'function') {
        return result.then(async (data) => {
          if (isObservable(data)) {
            return wrapObservableForWorkWithAsyncLocalStorage(data).pipe(
              concatMap(async (data) => {
                const user = await this.ssoCacheService.getCachedUser({
                  userId,
                });
                return this.authTimezoneService.convertObject(
                  data,
                  user?.timezone
                );
              })
            );
          } else {
            const user = await this.ssoCacheService.getCachedUser({ userId });
            // need for correct map types with base method of NestInterceptor
            return this.authTimezoneService.convertObject(
              data,
              user?.timezone
            ) as Observable<TData>;
          }
        });
      }
      // need for correct map types with base method of NestInterceptor
      return this.authTimezoneService.convertObject(
        result,
        req.ssoUser?.timezone
      ) as Observable<TData>;
    };

    return run();
  }
}
