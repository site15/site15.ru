import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { ActiveTenantPipe, SsoEmailTemplateGridComponent } from '@site15/sso-afat';
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
    ActiveTenantPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TemplatesComponent {}
