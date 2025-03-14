import { Route } from '@angular/router';
import {
  AUTH_GUARD_DATA_ROUTE_KEY,
  AuthGuardData,
  AuthGuardService,
} from '@nestjs-mod-sso/auth-angular';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { WebhooksComponent } from './pages/webhooks/webhooks.component';
import { AuthRoleInterface } from '@nestjs-mod-sso/app-angular-rest-sdk';

export const appRoutes: Route[] = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'webhooks',
    component: WebhooksComponent,
    canActivate: [AuthGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({
        roles: [AuthRoleInterface.Admin, AuthRoleInterface.Manager],
      }),
    },
  },
  {
    path: 'projects',
    component: ProjectsComponent,
    canActivate: [AuthGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({
        roles: [AuthRoleInterface.Admin],
      }),
    },
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({
        roles: [
          AuthRoleInterface.Admin,
          AuthRoleInterface.Manager,
          AuthRoleInterface.User,
        ],
      }),
    },
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    canActivate: [AuthGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({ roles: [] }),
    },
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
    canActivate: [AuthGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({ roles: [] }),
    },
  },
];
