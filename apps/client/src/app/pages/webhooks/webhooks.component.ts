import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { ActiveTenantPipe } from '@site15/sso-afat';
import { WebhookGridComponent, WebhookLogGridComponent } from '@nestjs-mod/webhook-afat';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

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
export class WebhooksComponent {}
