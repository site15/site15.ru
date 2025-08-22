import { Route } from '@angular/router';
import { marker } from '@jsverse/transloco-keys-manager/marker';

import {
  MetricsGithubRepositoryGridComponent,
  MetricsGithubMetricGridComponent,
  MetricsGithubUserGridComponent,
  MetricsGithubUserRepositoryGridComponent,
  MetricsUserGridComponent,
} from '@site15/metrics-afat';

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
  {
    path: 'github-users',
    component: MetricsGithubUserGridComponent,
    title: marker('Github users'),
  },
];
