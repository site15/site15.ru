import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  SsoSessionGridComponent,
  SsoUserGridComponent,
} from '@nestjs-mod-sso/sso-angular';
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {}
