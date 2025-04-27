import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import {
  FilesRestService,
  SsoRestService,
  TimeRestService,
  WebhookRestService,
} from '@nestjs-mod-sso/app-angular-rest-sdk';
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
    private readonly webhookRestService: WebhookRestService,
    private readonly timeRestService: TimeRestService,
    private readonly ssoService: SsoService,
    private readonly filesRestService: FilesRestService,
    private readonly ssoRestService: SsoRestService,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService,
    private readonly ssoActiveLangService: SsoActiveLangService,
    private readonly ssoActiveProjectService: SsoActiveProjectService,
    private readonly activatedRoute: ActivatedRoute
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
      this.webhookRestService.defaultHeaders = new HttpHeaders(
        authorizationHeaders
      );
      this.filesRestService.defaultHeaders = new HttpHeaders(
        authorizationHeaders
      );
      this.timeRestService.defaultHeaders = new HttpHeaders(
        authorizationHeaders
      );
      this.ssoRestService.defaultHeaders = new HttpHeaders(
        authorizationHeaders
      );
    }
  }
}
