import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  ActiveProjectPipe,
  SsoEmailTemplateGridComponent,
} from '@nestjs-mod-sso/sso-afat';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  imports: [
    NzBreadCrumbModule,
    SsoEmailTemplateGridComponent,
    NzGridModule,
    NzLayoutModule,
    TranslocoDirective,
    ActiveProjectPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplatesComponent {}
