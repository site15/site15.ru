import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  SsoProjectGridComponent,
  SsoSessionGridComponent,
  SsoUserGridComponent,
} from '@nestjs-mod-sso/sso-angular';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  imports: [
    NzBreadCrumbModule,
    SsoProjectGridComponent,
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
export class ProjectsComponent {}
