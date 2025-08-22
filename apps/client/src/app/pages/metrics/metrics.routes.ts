import { Route } from '@angular/router';
import { marker } from '@jsverse/transloco-keys-manager/marker';

import { MetricsGithubRepositoryGridComponent } from '@site15/metrics-afat';

export const metricsRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'github-repositories',
    pathMatch: 'full',
  },
  {
    path: 'github-repositories',
    component: MetricsGithubRepositoryGridComponent,
    title: marker('Github repositories'),
  },
];
