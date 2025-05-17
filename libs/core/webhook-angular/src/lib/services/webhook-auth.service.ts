import { Injectable } from '@angular/core';
import {
  SsoRestSdkAngularService,
  WebhookErrorInterface,
  WebhookUserInterface,
} from '@nestjs-mod/sso-rest-sdk-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { BehaviorSubject, catchError, of, tap, throwError } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class WebhookAuthService {
  private webhookUser$ = new BehaviorSubject<WebhookUserInterface | null>(null);

  constructor(
    private readonly ssoRestSdkAngularService: SsoRestSdkAngularService
  ) {}

  getWebhookUser() {
    return this.webhookUser$.value;
  }

  loadWebhookUser() {
    return this.ssoRestSdkAngularService
      .getWebhookApi()
      .webhookControllerProfile()
      .pipe(
        tap((profile) => this.webhookUser$.next(profile)),
        catchError((err: { error?: WebhookErrorInterface }) => {
          if (err.error?.code === 'WEBHOOK-002') {
            return of(null);
          }
          return throwError(() => err);
        })
      );
  }

  webhookUserUpdates() {
    return this.webhookUser$.asObservable();
  }
}
