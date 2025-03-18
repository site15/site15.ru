import { HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  AuthRestService,
  FilesRestService,
  SsoRestService,
  TimeRestService,
  WebhookRestService,
} from '@nestjs-mod-sso/app-angular-rest-sdk';
import {
  AUTH_CONFIGURATION_TOKEN,
  AuthActiveLangService,
  AuthConfiguration,
  AuthService,
  TokensService,
} from '@nestjs-mod-sso/auth-angular';
import { catchError, merge, mergeMap, of, Subscription, tap } from 'rxjs';
import { ActiveProjectService } from './integrations/active-project.service';

@Injectable({ providedIn: 'root' })
export class AppInitializer {
  private subscribeToTokenUpdatesSubscription?: Subscription;

  constructor(
    @Inject(AUTH_CONFIGURATION_TOKEN)
    private readonly authConfiguration: AuthConfiguration,
    private readonly webhookRestService: WebhookRestService,
    private readonly timeRestService: TimeRestService,
    private readonly authService: AuthService,
    private readonly filesRestService: FilesRestService,
    private readonly authRestService: AuthRestService,
    private readonly ssoRestService: SsoRestService,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService,
    private readonly authActiveLangService: AuthActiveLangService,
    private readonly activeProjectService: ActiveProjectService
  ) {}

  resolve() {
    this.subscribeToTokenUpdates();
    return this.authService.refreshToken().pipe(
      mergeMap(() => this.authActiveLangService.refreshActiveLang(true)),
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
      this.tokensService.getStream(),
      this.translocoService.langChanges$,
      this.activeProjectService.activePublicProject$
    )
      .pipe(tap(() => this.updateHeaders()))
      .subscribe();
  }

  private updateHeaders() {
    if (this.authConfiguration.getAuthorizationHeaders) {
      const authorizationHeaders =
        this.authConfiguration.getAuthorizationHeaders();
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
        this.authRestService.defaultHeaders = new HttpHeaders(
          authorizationHeaders
        );
        this.ssoRestService.defaultHeaders = new HttpHeaders(
          authorizationHeaders
        );
      }
    }
  }
}
