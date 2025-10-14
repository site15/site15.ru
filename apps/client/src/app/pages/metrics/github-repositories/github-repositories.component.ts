/* eslint-disable @typescript-eslint/no-empty-function */
import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  MetricsGithubRepositoryGridComponent,
  MetricsGithubRepositoryStatisticsGridComponent,
} from '@site15/metrics-afat';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

@Component({
  selector: 'app-users',
  templateUrl: './github-repositories.component.html',
  imports: [
    NzBreadCrumbModule,
    MetricsGithubRepositoryGridComponent,
    MetricsGithubRepositoryStatisticsGridComponent,
    NzGridModule,
    NzLayoutModule,
    AsyncPipe,
    TranslocoPipe,
    NgIf,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class GithubRepositoryComponent {
  @ViewChild('githubRepositoryGrid')
  githubRepositoryGrid!: MetricsGithubRepositoryGridComponent;

  @ViewChild('githubRepositoryStatisticsGrid')
  githubRepositoryStatisticsGrid!: MetricsGithubRepositoryStatisticsGridComponent;
}
