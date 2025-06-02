import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { SsoRoleInterface } from '@nestjs-mod/sso-rest-sdk-angular';
import { SsoService, SsoSignUpFormComponent } from '@nestjs-mod-sso/sso-afat';
import { searchIn } from '@nestjs-mod/misc';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  imports: [NzBreadCrumbModule, TranslocoDirective, SsoSignUpFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent {
  constructor(
    private readonly router: Router,
    private readonly ssoService: SsoService
  ) {}
  onAfterSignUp() {
    if (
      searchIn(SsoRoleInterface.admin, this.ssoService.profile$.value?.roles)
    ) {
      this.router.navigate(['/projects']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
