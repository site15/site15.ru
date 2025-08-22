import { Route } from '@angular/router';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { SsoRoleInterface } from '@site15/rest-sdk-angular';
import {
  CompleteSignUpOptions,
  OnActivateOptions,
  SSO_ACTIVE_USER_CLIENT_ID_STORAGE_KEY,
  SSO_COMPLETE_GUARD_DATA_ROUTE_KEY,
  SSO_GUARD_DATA_ROUTE_KEY,
  SsoCompleteGuardData,
  SsoCompleteGuardService,
  SsoGuardData,
  SsoGuardService,
} from '@site15/sso-afat';
import { searchIn } from '@nestjs-mod/misc';
import { CompleteForgotPasswordComponent } from './pages/complete-forgot-password/complete-forgot-password.component';
import { CompleteInviteComponent } from './pages/complete-invite/complete-invite.component';
import { CompleteSignUpComponent } from './pages/complete-sign-up/complete-sign-up.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TenantsComponent } from './pages/tenants/tenants.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { TemplatesComponent } from './pages/templates/templates.component';
import { UsersComponent } from './pages/users/users.component';
import { WebhooksComponent } from './pages/webhooks/webhooks.component';
import { MetricsComponent } from './pages/metrics/metrics.component';
import { metricsRoutes } from './pages/metrics/metrics.routes';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
    title: marker('Home'),
  },
  {
    path: 'webhooks',
    component: WebhooksComponent,
    title: marker('Webhooks'),
    canActivate: [SsoGuardService],
    data: {
      [SSO_GUARD_DATA_ROUTE_KEY]: new SsoGuardData({
        roles: [SsoRoleInterface.manager, SsoRoleInterface.admin],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'templates',
    title: marker('Templates'),
    component: TemplatesComponent,
    canActivate: [SsoGuardService],
    data: {
      [SSO_GUARD_DATA_ROUTE_KEY]: new SsoGuardData({
        roles: [SsoRoleInterface.manager, SsoRoleInterface.admin],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'metrics',
    title: marker('Metrics'),
    component: MetricsComponent,
    canActivate: [SsoGuardService],
    data: {
      [SSO_GUARD_DATA_ROUTE_KEY]: new SsoGuardData({
        roles: [SsoRoleInterface.manager, SsoRoleInterface.admin],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/metrics']);
            return false;
          }
          return true;
        },
      }),
    },
    children: metricsRoutes,
  },
  {
    path: 'users',
    component: UsersComponent,
    title: marker('Users'),
    canActivate: [SsoGuardService],
    data: {
      [SSO_GUARD_DATA_ROUTE_KEY]: new SsoGuardData({
        roles: [SsoRoleInterface.manager, SsoRoleInterface.admin],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'tenants',
    component: TenantsComponent,
    title: marker('Tenants'),
    canActivate: [SsoGuardService],
    data: {
      [SSO_GUARD_DATA_ROUTE_KEY]: new SsoGuardData({
        roles: [SsoRoleInterface.admin],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'profile',
    component: ProfileComponent,
    title: marker('Profile'),
    canActivate: [SsoGuardService],
    data: {
      [SSO_GUARD_DATA_ROUTE_KEY]: new SsoGuardData({
        roles: [SsoRoleInterface.admin, SsoRoleInterface.manager, SsoRoleInterface.user],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    title: marker('Sign-in'),
    canActivate: [SsoGuardService],
    data: {
      [SSO_GUARD_DATA_ROUTE_KEY]: new SsoGuardData({
        roles: [],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
    title: marker('Sign-up'),
    canActivate: [SsoGuardService],
    data: {
      [SSO_GUARD_DATA_ROUTE_KEY]: new SsoGuardData({
        roles: [],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'complete-sign-up',
    component: CompleteSignUpComponent,
    title: marker('Complete sign up'),
    canActivate: [SsoCompleteGuardService],
    data: {
      [SSO_COMPLETE_GUARD_DATA_ROUTE_KEY]: new SsoCompleteGuardData({
        type: 'complete-sign-up',

        beforeCompleteSignUp: async (options: CompleteSignUpOptions) => {
          const clientId = options.activatedRouteSnapshot.queryParamMap.get('client_id');
          if (clientId && clientId !== undefined) {
            localStorage.setItem(SSO_ACTIVE_USER_CLIENT_ID_STORAGE_KEY, clientId);
            options.ssoService.updateHeaders();
          }
          return true;
        },
        afterCompleteSignUp: async (options: CompleteSignUpOptions) => {
          if (options.error) {
            return false;
          }

          const redirectUri = options.activatedRouteSnapshot.queryParamMap.get('redirect_uri');
          if (!redirectUri) {
            if (options.ssoService && options.router) {
              if (searchIn(SsoRoleInterface.admin, options.ssoService.profile$.value?.roles)) {
                options.router.navigate(['/tenants']);
              } else {
                options.router.navigate(['/home']);
              }
            }
          } else {
            location.href = redirectUri;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'complete-oauth-sign-up',
    component: CompleteSignUpComponent,
    title: marker('Complete OAuth sign up'),
    canActivate: [SsoCompleteGuardService],
    data: {
      [SSO_COMPLETE_GUARD_DATA_ROUTE_KEY]: new SsoCompleteGuardData({
        type: 'complete-oauth-sign-up',

        beforeCompleteSignUp: async (options: CompleteSignUpOptions) => {
          const clientId = options.activatedRouteSnapshot.queryParamMap.get('client_id');
          if (clientId && clientId !== undefined) {
            localStorage.setItem(SSO_ACTIVE_USER_CLIENT_ID_STORAGE_KEY, clientId);
            options.ssoService.updateHeaders();
          }
          return true;
        },
        afterCompleteSignUp: async (options: CompleteSignUpOptions) => {
          if (options.error) {
            return false;
          }

          const redirectUri = options.activatedRouteSnapshot.queryParamMap.get('redirect_uri');
          if (!redirectUri) {
            if (options.ssoService && options.router) {
              if (searchIn(SsoRoleInterface.admin, options.ssoService.profile$.value?.roles)) {
                options.router.navigate(['/tenants']);
              } else {
                options.router.navigate(['/home']);
              }
            }
          } else {
            location.href = redirectUri;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    title: marker('Password recovery'),
    canActivate: [SsoGuardService],
    data: {
      [SSO_GUARD_DATA_ROUTE_KEY]: new SsoGuardData({
        roles: [],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'complete-forgot-password',
    component: CompleteForgotPasswordComponent,
    title: marker('Сomplete forgot password'),
    canActivate: [SsoGuardService, SsoCompleteGuardService],
    data: {
      [SSO_GUARD_DATA_ROUTE_KEY]: new SsoGuardData({
        roles: [],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
      [SSO_COMPLETE_GUARD_DATA_ROUTE_KEY]: new SsoCompleteGuardData({
        type: 'complete-forgot-password',
      }),
    },
  },
  {
    path: 'complete-invite',
    component: CompleteInviteComponent,
    title: marker('Completing registration'),
    canActivate: [SsoGuardService, SsoCompleteGuardService],
    data: {
      [SSO_GUARD_DATA_ROUTE_KEY]: new SsoGuardData({
        roles: [],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
      [SSO_COMPLETE_GUARD_DATA_ROUTE_KEY]: new SsoCompleteGuardData({
        type: 'complete-invite',
      }),
    },
  },
];
