import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { SsoActiveLangService, SsoActiveTenantService, SsoService, TokensService } from '@site15/sso-afat';
import { FilesRestSdkAngularService } from '@nestjs-mod/files-afat';
import { Site15RestSdkAngularService } from '@site15/rest-sdk-angular';
import { WebhookRestSdkAngularService } from '@nestjs-mod/webhook-afat';
import { catchError, merge, mergeMap, of, Subscription, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppInitializer {
  private subscribeToTokenUpdatesSubscription?: Subscription;

  constructor(
    private readonly ssoService: SsoService,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService,
    private readonly ssoActiveLangService: SsoActiveLangService,
    private readonly ssoActiveTenantService: SsoActiveTenantService,
    private readonly site15RestSdkAngularService: Site15RestSdkAngularService,
    private readonly webhookRestSdkAngularService: WebhookRestSdkAngularService,
    private readonly filesRestSdkAngularService: FilesRestSdkAngularService,
  ) {}

  resolve() {
    this.subscribeToTokenUpdates();
    return this.ssoService.refreshToken().pipe(
      mergeMap(() => this.ssoActiveLangService.refreshActiveLang(true)),
      catchError((err) => {
        console.error(err);
        return of(true);
      }),
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
      this.ssoActiveTenantService.activePublicTenant$,
    )
      .pipe(tap(() => this.updateHeaders()))
      .subscribe();
  }

  private updateHeaders() {
    const authorizationHeaders = this.ssoService.getAuthorizationHeaders();
    if (authorizationHeaders) {
      this.site15RestSdkAngularService.updateHeaders(authorizationHeaders);
      this.webhookRestSdkAngularService.updateHeaders(authorizationHeaders);
      this.filesRestSdkAngularService.updateHeaders(authorizationHeaders);
    }
  }
}
