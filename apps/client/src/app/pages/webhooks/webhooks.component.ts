import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { WebhookGridComponent, WebhookLogGridComponent } from '@nestjs-mod/webhook-afat';
import { ActiveTenantPipe, SsoTenantService } from '@site15/sso-afat';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { map } from 'rxjs';

@Component({
  selector: 'app-webhooks',
  templateUrl: './webhooks.component.html',
  imports: [
    NzBreadCrumbModule,
    WebhookGridComponent,
    WebhookLogGridComponent,
    NzGridModule,
    NzLayoutModule,
    AsyncPipe,
    NgIf,
    TranslocoDirective,
    ActiveTenantPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class WebhooksComponent {
  constructor(private readonly ssoTenantService: SsoTenantService) {}

  loadManyTenantsHandler = (searchText = '') =>
    this.ssoTenantService
      .findMany({ filters: { search: searchText }, meta: { perPage: 10, curPage: 1, sort: { createdAt: 'desc' } } })
      .pipe(map((result) => result.ssoTenants.map((t) => ({ label: `${t.name} - ${t.slug}`, value: t.id || '' }))));
}
