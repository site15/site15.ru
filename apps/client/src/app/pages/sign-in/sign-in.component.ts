import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthRoleInterface } from '@nestjs-mod-sso/app-angular-rest-sdk';
import {
  AuthService,
  AuthSignInFormComponent,
} from '@nestjs-mod-sso/auth-angular';
import { searchIn } from '@nestjs-mod/misc';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  imports: [NzBreadCrumbModule, TranslocoDirective, AuthSignInFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}
  onAfterSignIn() {
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
