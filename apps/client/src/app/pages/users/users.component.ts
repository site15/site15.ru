import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { ActiveTenantPipe, SsoSessionGridComponent, SsoUserGridComponent } from '@site15/sso-afat';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  imports: [
    NzBreadCrumbModule,
    SsoUserGridComponent,
    SsoSessionGridComponent,
    NzGridModule,
    NzLayoutModule,
    TranslocoDirective,
    AsyncPipe,
    NgIf,
    ActiveTenantPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class UsersComponent {}
