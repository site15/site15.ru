import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AuthCompleteForgotPasswordInput,
  AuthCompleteSignUpInput,
  AuthForgotPasswordInput,
  AuthLoginInput,
  AuthSignupInput,
  AuthUpdateProfileInput,
  AuthUser,
  AuthUserAndTokens,
  OAuthProvider,
} from './auth.types';

export type AfterUpdateProfileEvent = {
  old?: AuthUser;
  new?: AuthUser;
};

export class AuthConfiguration {
  constructor(options?: AuthConfiguration) {
    Object.assign(this, options);
  }
  logout!: () => Observable<void | null>;
  getProfile!: () => Observable<AuthUser | undefined>;
  refreshToken!: () => Observable<AuthUserAndTokens | undefined>;
  signup!: (data: AuthSignupInput) => Observable<AuthUserAndTokens>;
  login!: (data: AuthLoginInput) => Observable<AuthUserAndTokens>;
  updateProfile!: (data: AuthUpdateProfileInput) => Observable<void | null>;
  completeSignUp!: (
    data: AuthCompleteSignUpInput
  ) => Observable<AuthUserAndTokens>;
  forgotPassword!: (data: AuthForgotPasswordInput) => Observable<true>;
  completeForgotPassword!: (
    data: AuthCompleteForgotPasswordInput
  ) => Observable<AuthUserAndTokens>;
  getAuthorizationHeaders?: () => Record<string, string>;
  getOAuthProviders?: () => Observable<OAuthProvider[]>;
}

export const AUTH_CONFIGURATION_TOKEN = new InjectionToken<string>(
  'AUTH_CONFIGURATION_TOKEN'
);
