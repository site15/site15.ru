import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  AuthCompleteForgotPasswordFormComponent,
  AuthService,
} from '@nestjs-mod-sso/auth-angular';
import { AUTH_ACTIVE_USER_CLIENT_ID_STORAGE_KEY } from '@nestjs-mod-sso/sso-angular';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'app-complete-forgot-password',
  templateUrl: './complete-forgot-password.component.html',
  imports: [
    NzBreadCrumbModule,
    TranslocoDirective,
    AuthCompleteForgotPasswordFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompleteForgotPasswordComponent {
  code?: string | null;
  redirectUri?: string | null;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService
  ) {
    this.code = this.activatedRoute.snapshot.queryParamMap.get('code');
    this.redirectUri =
      this.activatedRoute.snapshot.queryParamMap.get('redirect_uri');

    const clientId =
      this.activatedRoute.snapshot.queryParamMap.get('client_id');
    if (clientId && clientId !== undefined) {
      localStorage.setItem(AUTH_ACTIVE_USER_CLIENT_ID_STORAGE_KEY, clientId);
    }
  }

  onAfterCompleteForgotPassword() {
    if (!this.redirectUri) {
      if (this.authService.profile$.value?.roles?.includes('admin')) {
        this.router.navigate(['/projects']);
      } else {
        this.router.navigate(['/home']);
      }
    } else {
      location.href = this.redirectUri;
    }
  }
}
