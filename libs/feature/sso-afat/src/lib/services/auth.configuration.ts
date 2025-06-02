/* eslint-disable @typescript-eslint/no-unused-vars */
import { InjectionToken } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
  OAuthProvider,
  OAuthVerificationInput,
  SsoCompleteForgotPasswordInput,
  SsoCompleteSignUpInput,
  SsoForgotPasswordInput,
  SsoLoginInput,
  SsoSignupInput,
  SsoUpdateProfileInput,
  SsoUser,
  SsoUserAndTokens,
} from './auth.types';

export type AfterUpdateProfileEvent = {
  old?: SsoUser;
  new?: SsoUser;
};

export class SsoConfiguration {
  constructor(options?: SsoConfiguration) {
    Object.assign(this, options);
  }
  // todo: remove not need options
  logout(): Observable<void | null> {
    return throwError(() => new Error('not implemented'));
  }
  getProfile(): Observable<SsoUser | undefined> {
    return throwError(() => new Error('not implemented'));
  }
  refreshToken(): Observable<SsoUserAndTokens | undefined> {
    return throwError(() => new Error('not implemented'));
  }
  signup(data: SsoSignupInput): Observable<SsoUserAndTokens> {
    return throwError(() => new Error('not implemented'));
  }
  login(data: SsoLoginInput): Observable<SsoUserAndTokens> {
    return throwError(() => new Error('not implemented'));
  }
  updateProfile(data: SsoUpdateProfileInput): Observable<void | null> {
    return throwError(() => new Error('not implemented'));
  }
  completeSignUp(data: SsoCompleteSignUpInput): Observable<SsoUserAndTokens> {
    return throwError(() => new Error('not implemented'));
  }
  forgotPassword(data: SsoForgotPasswordInput): Observable<true> {
    return throwError(() => new Error('not implemented'));
  }
  completeForgotPassword(
    data: SsoCompleteForgotPasswordInput
  ): Observable<SsoUserAndTokens> {
    return throwError(() => new Error('not implemented'));
  }
  getAuthorizationHeaders(): Record<string, string> {
    throw new Error('not implemented');
  }
  oAuthProviders(): Observable<OAuthProvider[]> {
    return throwError(() => new Error('not implemented'));
  }
  oAuthVerification({
    verificationCode,
    clientId,
  }: OAuthVerificationInput): Observable<SsoUserAndTokens> {
    return throwError(() => new Error('not implemented'));
  }
}

export const SSO_CONFIGURATION_TOKEN = new InjectionToken<string>(
  'SSO_CONFIGURATION_TOKEN'
);
