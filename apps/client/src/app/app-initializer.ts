import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { RestSdkAngularService } from '@nestjs-mod/sso-rest-sdk-angular';
import {
  SsoActiveLangService,
  SsoActiveProjectService,
  SsoService,
  TokensService,
} from '@nestjs-mod-sso/sso-angular';
import { catchError, merge, mergeMap, of, Subscription, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppInitializer {
  private subscribeToTokenUpdatesSubscription?: Subscription;

  constructor(
    private readonly ssoService: SsoService,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService,
    private readonly ssoActiveLangService: SsoActiveLangService,
    private readonly ssoActiveProjectService: SsoActiveProjectService,
    private readonly restSdkAngularService: RestSdkAngularService
  ) {}

  resolve() {
    this.subscribeToTokenUpdates();
    return this.ssoService.refreshToken().pipe(
      mergeMap(() => this.ssoActiveLangService.refreshActiveLang(true)),
      catchError((err) => {
        console.error(err);
        return of(true);
      })
    );
  }

  private subscribeToTokenUpdates() {
    if (this.subscribeToTokenUpdatesSubscription) {
      this.subscribeToTokenUpdatesSubscription.unsubscribe();
      this.subscribeToTokenUpdatesSubscription = undefined;
    }
    this.updateHeaders();
    this.subscribeToTokenUpdatesSubscription = merge(
      this.ssoService.updateHeaders$.asObservable(),
      this.tokensService.getStream(),
      this.translocoService.langChanges$,
      this.ssoActiveProjectService.activePublicProject$
    )
      .pipe(tap(() => this.updateHeaders()))
      .subscribe();
  }

  private updateHeaders() {
    const authorizationHeaders = this.ssoService.getAuthorizationHeaders();
    if (authorizationHeaders) {
      this.restSdkAngularService.updateHeaders(authorizationHeaders);
    }
  }
}
