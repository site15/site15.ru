import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, concatMap, first, from, map, of } from 'rxjs';
import { SsoService } from './auth.service';

export const SSO_GUARD_DATA_ROUTE_KEY = 'ssoGuardData';

export type OnActivateOptions = {
  activatedRouteSnapshot: ActivatedRouteSnapshot;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  ssoService: SsoService;
  router: Router;
};

export class SsoGuardData {
  roles?: string[];

  afterActivate?: (options: OnActivateOptions) => Promise<boolean>;

  constructor(options?: SsoGuardData) {
    Object.assign(this, options);
  }
}

@Injectable({ providedIn: 'root' })
export class SsoGuardService implements CanActivate {
  constructor(
    private readonly ssoService: SsoService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot) {
    const ssoGuardData =
      route.data && route.data[SSO_GUARD_DATA_ROUTE_KEY] instanceof SsoGuardData
        ? route.data[SSO_GUARD_DATA_ROUTE_KEY]
        : null;
    if (ssoGuardData) {
      return this.checkUserRoles(ssoGuardData?.roles).pipe(
        first(),
        concatMap(async (result) => {
          if (!result) {
            throw new Error('Forbidden');
          }
          return result;
        }),
        concatMap(async () => {
          if (ssoGuardData.afterActivate) {
            await ssoGuardData.afterActivate({
              activatedRouteSnapshot: route,
              ssoService: this.ssoService,
              router: this.router,
            });
          }
          return true;
        }),
        catchError((err) => {
          console.error(err);
          this.nzMessageService.error(
            this.translocoService.translate(err.error?.message || err.message)
          );
          if (ssoGuardData.afterActivate) {
            return from(
              ssoGuardData.afterActivate({
                activatedRouteSnapshot: route,
                ssoService: this.ssoService,
                router: this.router,
                error: err,
              })
            );
          }
          return of(false);
        })
      );
    }
    return of(true);
  }

  checkUserRoles(ssoRoles?: string[]) {
    return this.ssoService.profile$.pipe(
      map((ssoUser) => {
        const ssoGuardDataRoles = (ssoRoles || []).map((role) =>
          role.toLowerCase()
        );
        const result = Boolean(
          (ssoUser &&
            ssoGuardDataRoles.length > 0 &&
            ssoGuardDataRoles.some((r) =>
              ssoUser.roles?.map((r) => r.toLowerCase()).includes(r)
            )) ||
            (ssoGuardDataRoles.length === 0 && !ssoUser?.roles)
        );
        if (!result) {
          console.log(result, { ssoUser: ssoUser, ssoGuardDataRoles }, [
            [
              ssoUser,
              ssoGuardDataRoles.length > 0,
              ssoUser &&
                ssoGuardDataRoles
                  .map((role) => role.toLowerCase())
                  .some((r) =>
                    ssoUser.roles?.map((r) => r.toLowerCase()).includes(r)
                  ),
            ],
            [ssoGuardDataRoles.length === 0, !ssoUser?.roles],
          ]);
        }
        return result;
      })
    );
  }
}
