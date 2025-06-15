import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, concatMap, from, map, mergeMap, of } from 'rxjs';
import { SsoService } from './auth.service';

export const SSO_COMPLETE_GUARD_DATA_ROUTE_KEY = 'ssoGuardCompleteData';

export type CompleteSignUpOptions = {
  activatedRouteSnapshot: ActivatedRouteSnapshot;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  ssoService: SsoService;
  router: Router;
};

export class SsoCompleteGuardData {
  type?: 'complete-sign-up' | 'complete-forgot-password' | 'complete-invite' | 'complete-oauth-sign-up';

  beforeCompleteSignUp?: (options: CompleteSignUpOptions) => Promise<boolean>;

  afterCompleteSignUp?: (options: CompleteSignUpOptions) => Promise<boolean>;

  constructor(options?: SsoCompleteGuardData) {
    Object.assign(this, options);
  }
}

@Injectable({ providedIn: 'root' })
export class SsoCompleteGuardService implements CanActivate {
  constructor(
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly ssoService: SsoService,
    private readonly router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot) {
    const ssoCompleteGuardData =
      route.data && route.data[SSO_COMPLETE_GUARD_DATA_ROUTE_KEY] instanceof SsoCompleteGuardData
        ? route.data[SSO_COMPLETE_GUARD_DATA_ROUTE_KEY]
        : null;
    if (ssoCompleteGuardData) {
      if (ssoCompleteGuardData.type === 'complete-oauth-sign-up') {
        const verificationCode = route.queryParamMap.get('verification_code');
        const clientId = route.queryParamMap.get('client_id');
        if (verificationCode) {
          return (
            ssoCompleteGuardData.beforeCompleteSignUp
              ? from(
                  ssoCompleteGuardData.beforeCompleteSignUp({
                    activatedRouteSnapshot: route,
                    ssoService: this.ssoService,
                    router: this.router,
                  }),
                )
              : of(true)
          ).pipe(
            mergeMap(() =>
              this.ssoService.oAuthVerification({
                verificationCode,
                clientId: clientId || undefined,
              }),
            ),
            map(async () => {
              this.nzMessageService.success(
                this.translocoService.translate('Successful login using external single sign-on system'),
              );
              return true;
            }),
            mergeMap(() => this.ssoService.refreshToken()),
            concatMap(async () => {
              if (ssoCompleteGuardData.afterCompleteSignUp) {
                await ssoCompleteGuardData.afterCompleteSignUp({
                  activatedRouteSnapshot: route,
                  ssoService: this.ssoService,
                  router: this.router,
                });
              }
              return true;
            }),
            catchError((err) => {
              console.error(err);
              this.nzMessageService.error(this.translocoService.translate(err.error?.message || err.message));
              if (ssoCompleteGuardData.afterCompleteSignUp) {
                return from(
                  ssoCompleteGuardData.afterCompleteSignUp({
                    activatedRouteSnapshot: route,
                    ssoService: this.ssoService,
                    router: this.router,
                    error: err,
                  }),
                );
              }
              return of(false);
            }),
          );
        }
      }
      if (ssoCompleteGuardData.type === 'complete-sign-up') {
        const code = route.queryParamMap.get('code');
        if (code) {
          return (
            ssoCompleteGuardData.beforeCompleteSignUp
              ? from(
                  ssoCompleteGuardData.beforeCompleteSignUp({
                    activatedRouteSnapshot: route,
                    ssoService: this.ssoService,
                    router: this.router,
                  }),
                )
              : of(true)
          ).pipe(
            mergeMap(() =>
              this.ssoService.completeSignUp({
                code,
              }),
            ),
            map(async () => {
              this.nzMessageService.success(this.translocoService.translate('Email address successfully verified'));
              return true;
            }),
            mergeMap(() => this.ssoService.refreshToken()),
            concatMap(async () => {
              if (ssoCompleteGuardData.afterCompleteSignUp) {
                await ssoCompleteGuardData.afterCompleteSignUp({
                  activatedRouteSnapshot: route,
                  ssoService: this.ssoService,
                  router: this.router,
                });
              }
              return true;
            }),
            catchError((err) => {
              console.error(err);
              this.nzMessageService.error(this.translocoService.translate(err.error?.message || err.message));
              if (ssoCompleteGuardData.afterCompleteSignUp) {
                return from(
                  ssoCompleteGuardData.afterCompleteSignUp({
                    activatedRouteSnapshot: route,
                    ssoService: this.ssoService,
                    router: this.router,
                    error: err,
                  }),
                );
              }
              return of(false);
            }),
          );
        }
      }
    }
    return of(true);
  }
}
