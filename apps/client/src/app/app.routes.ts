import { Route } from '@angular/router';
import { AuthRoleInterface } from '@nestjs-mod-sso/app-angular-rest-sdk';
import {
  AfterCompleteSignUpOptions,
  AUTH_COMPLETE_GUARD_DATA_ROUTE_KEY,
  AUTH_GUARD_DATA_ROUTE_KEY,
  AuthCompleteGuardData,
  AuthCompleteGuardService,
  AuthGuardData,
  AuthGuardService,
} from '@nestjs-mod-sso/auth-angular';
import { CompleteForgotPasswordComponent } from './pages/complete-forgot-password/complete-forgot-password.component';
import { CompleteSignUpComponent } from './pages/complete-sign-up/complete-sign-up.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { UsersComponent } from './pages/users/users.component';
import { WebhooksComponent } from './pages/webhooks/webhooks.component';

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
    path: 'users',
    component: UsersComponent,
    canActivate: [AuthGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({
        roles: [AuthRoleInterface.Manager],
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
  {
    path: 'complete-sign-up',
    component: CompleteSignUpComponent,
    canActivate: [AuthCompleteGuardService],
    data: {
      [AUTH_COMPLETE_GUARD_DATA_ROUTE_KEY]: new AuthCompleteGuardData({
        type: 'complete-sign-up',
        afterCompleteSignUp: async (options: AfterCompleteSignUpOptions) => {
          if (options.error) {
            return false;
          }
          const redirectUri =
            options.activatedRouteSnapshot.queryParamMap.get('redirect_uri');
          if (!redirectUri) {
            if (options.authService && options.router) {
              if (
                options.authService.profile$.value?.roles?.includes('admin')
              ) {
                options.router.navigate(['/webhooks']);
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
    canActivate: [AuthGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({ roles: [] }),
    },
  },
  {
    path: 'complete-forgot-password',
    component: CompleteForgotPasswordComponent,
    canActivate: [AuthCompleteGuardService],
    data: {
      [AUTH_COMPLETE_GUARD_DATA_ROUTE_KEY]: new AuthCompleteGuardData({
        type: 'complete-forgot-password',
      }),
    },
  },
];
