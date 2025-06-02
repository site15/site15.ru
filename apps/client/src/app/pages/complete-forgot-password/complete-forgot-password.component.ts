import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { SsoRoleInterface } from '@nestjs-mod/sso-rest-sdk-angular';
import {
  SSO_ACTIVE_USER_CLIENT_ID_STORAGE_KEY,
  SsoCompleteForgotPasswordFormComponent,
  SsoService,
} from '@nestjs-mod-sso/sso-afat';
import { searchIn } from '@nestjs-mod/misc';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'app-complete-forgot-password',
  templateUrl: './complete-forgot-password.component.html',
  imports: [
    NzBreadCrumbModule,
    TranslocoDirective,
    SsoCompleteForgotPasswordFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompleteForgotPasswordComponent {
  code?: string | null;
  redirectUri?: string | null;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly ssoService: SsoService
  ) {
    this.code = this.activatedRoute.snapshot.queryParamMap.get('code');
    this.redirectUri =
      this.activatedRoute.snapshot.queryParamMap.get('redirect_uri');

    const clientId =
      this.activatedRoute.snapshot.queryParamMap.get('client_id');
    if (clientId && clientId !== undefined) {
      localStorage.setItem(SSO_ACTIVE_USER_CLIENT_ID_STORAGE_KEY, clientId);
    }
  }

  onAfterCompleteForgotPassword() {
    if (!this.redirectUri) {
      if (
        searchIn(SsoRoleInterface.admin, this.ssoService.profile$.value?.roles)
      ) {
        this.router.navigate(['/projects']);
      } else {
        this.router.navigate(['/home']);
      }
    } else {
      location.href = this.redirectUri;
    }
  }
}
