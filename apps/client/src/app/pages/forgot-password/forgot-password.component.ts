import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { SsoForgotPasswordFormComponent } from '@site15/sso-afat';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  imports: [NzBreadCrumbModule, TranslocoDirective, SsoForgotPasswordFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ForgotPasswordComponent {}
