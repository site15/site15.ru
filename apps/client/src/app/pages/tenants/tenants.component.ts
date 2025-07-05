import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { SsoTenantGridComponent } from '@nestjs-mod-sso/sso-afat';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

@Component({
  selector: 'app-tenants',
  templateUrl: './tenants.component.html',
  imports: [NzBreadCrumbModule, SsoTenantGridComponent, NzGridModule, NzLayoutModule, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TenantsComponent {}
