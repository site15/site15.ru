import { Route } from '@angular/router';
import { marker } from '@jsverse/transloco-keys-manager/marker';

import {
  MetricsGithubRepositoryGridComponent,
  MetricsGithubMetricGridComponent,
  MetricsGithubUserGridComponent,
  MetricsGithubUserRepositoryGridComponent,
  MetricsUserGridComponent,
  MetricsGithubRepositoryStatisticsGridComponent,
  MetricsGithubTeamGridComponent,
  MetricsGithubTeamRepositoryGridComponent,
  MetricsGithubTeamUserGridComponent,
  MetricsGithubUserStatisticsGridComponent,
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
  {
    path: 'github-metrics',
    component: MetricsGithubMetricGridComponent,
    title: marker('Github metrics'),
  },
  {
    path: 'github-user-repositories',
    component: MetricsGithubUserRepositoryGridComponent,
    title: marker('Github user repositories'),
  },
  {
    path: 'users',
    component: MetricsUserGridComponent,
    title: marker('Users'),
  },
  {
    path: 'github-repository-statistics',
    component: MetricsGithubRepositoryStatisticsGridComponent,
    title: marker('Github repository statistics'),
  },
  {
    path: 'github-teams',
    component: MetricsGithubTeamGridComponent,
    title: marker('Github teams'),
  },
  {
    path: 'github-team-repositories',
    component: MetricsGithubTeamRepositoryGridComponent,
    title: marker('Github team repositories'),
  },
  {
    path: 'github-team-users',
    component: MetricsGithubTeamUserGridComponent,
    title: marker('Github team users'),
  },
  {
    path: 'github-user-statistics',
    component: MetricsGithubUserStatisticsGridComponent,
    title: marker('Github user statistics'),
  },
];
