import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthRoleInterface } from '@nestjs-mod-sso/app-angular-rest-sdk';
import {
  AuthService,
  AuthSignUpFormComponent,
} from '@nestjs-mod-sso/auth-angular';
import { searchIn } from '@nestjs-mod-sso/common-angular';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  imports: [NzBreadCrumbModule, TranslocoDirective, AuthSignUpFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent {
  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}
  onAfterSignUp() {
    if (
      searchIn(
        [AuthRoleInterface.Admin],
        this.authService.profile$.value?.roles
      )
    ) {
      this.router.navigate(['/projects']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
