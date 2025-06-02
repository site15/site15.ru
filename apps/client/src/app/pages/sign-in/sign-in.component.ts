import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { SsoRoleInterface } from '@nestjs-mod/sso-rest-sdk-angular';
import { SsoService, SsoSignInFormComponent } from '@nestjs-mod-sso/sso-afat';
import { searchIn } from '@nestjs-mod/misc';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  imports: [NzBreadCrumbModule, TranslocoDirective, SsoSignInFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  constructor(
    private readonly router: Router,
    private readonly ssoService: SsoService
  ) {}
  onAfterSignIn() {
    if (
      searchIn(SsoRoleInterface.admin, this.ssoService.profile$.value?.roles)
    ) {
      this.router.navigate(['/projects']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
