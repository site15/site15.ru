import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { SsoProfileFormComponent } from '@site15/sso-afat';
import { UntilDestroy } from '@ngneat/until-destroy';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@UntilDestroy()
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [NzBreadCrumbModule, SsoProfileFormComponent, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ProfileComponent {}
