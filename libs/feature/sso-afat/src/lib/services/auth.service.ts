import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, mergeMap, Observable, of, Subject } from 'rxjs';
import { SSO_CONFIGURATION_TOKEN, SsoConfiguration } from './auth.configuration';
import {
  SsoCompleteForgotPasswordInput,
  SsoCompleteSignUpInput,
  SsoForgotPasswordInput,
  SsoLoginInput,
  SsoSignupInput,
  SsoUpdateProfileInput,
  SsoUser,
  SsoUserAndTokens,
  OAuthVerificationInput,
} from './auth.types';
import { TokensService } from './tokens.service';

@Injectable({ providedIn: 'root' })
export class SsoService {
  profile$ = new BehaviorSubject<SsoUser | undefined>(undefined);
  updateHeaders$ = new Subject<boolean>();

  constructor(
    protected readonly tokensService: TokensService,
    @Inject(SSO_CONFIGURATION_TOKEN)
    protected readonly ssoConfiguration: SsoConfiguration,
  ) {}

  updateHeaders() {
    this.updateHeaders$.next(true);
  }

  completeSignUp(data: SsoCompleteSignUpInput): Observable<SsoUserAndTokens | null> {
    return this.ssoConfiguration.completeSignUp
      ? this.ssoConfiguration.completeSignUp(data).pipe(
          mergeMap((result) => {
            return this.setProfileAndTokens(result).pipe(
              map((profile) => ({
                profile,
                tokens: result.tokens,
              })),
            );
          }),
        )
      : of(null);
  }

  forgotPassword(data: SsoForgotPasswordInput): Observable<true | null> {
    return this.ssoConfiguration.forgotPassword ? this.ssoConfiguration.forgotPassword(data) : of(null);
  }

  completeForgotPassword(data: SsoCompleteForgotPasswordInput): Observable<SsoUserAndTokens | null> {
    return this.ssoConfiguration.completeForgotPassword
      ? this.ssoConfiguration.completeForgotPassword(data).pipe(
          mergeMap((result) => {
            return this.setProfileAndTokens(result).pipe(
              map((profile) => ({
                profile,
                tokens: result.tokens,
              })),
            );
          }),
        )
      : of(null);
  }

  getAuthorizationHeaders() {
    return this.ssoConfiguration.getAuthorizationHeaders ? this.ssoConfiguration.getAuthorizationHeaders() : undefined;
  }

  signUp(data: SsoSignupInput) {
    return this.ssoConfiguration
      .signup({
        ...data,
        email: data.email?.toLowerCase(),
      })
      .pipe(
        mergeMap((result) => {
          return this.setProfileAndTokens(result).pipe(
            map((profile) => ({
              profile,
              tokens: result.tokens,
            })),
          );
        }),
      );
  }

  updateProfile(data: SsoUpdateProfileInput) {
    return this.ssoConfiguration.updateProfile(data).pipe(
      mergeMap(() => this.ssoConfiguration.getProfile()),
      mergeMap((result) => this.setProfile(result)),
    );
  }

  signIn(data: SsoLoginInput) {
    return this.ssoConfiguration
      .login({
        ...data,
        email: data.email?.toLowerCase(),
      })
      .pipe(
        mergeMap((result) => {
          return this.setProfileAndTokens(result).pipe(
            map((profile) => ({
              profile,
              tokens: result.tokens,
            })),
          );
        }),
      );
  }

  signOut() {
    return this.ssoConfiguration.logout().pipe(
      mergeMap(() => {
        return this.clearProfileAndTokens();
      }),
      catchError((err) => {
        console.error(err);
        return this.clearProfileAndTokens();
      }),
    );
  }

  refreshToken() {
    return this.ssoConfiguration.refreshToken().pipe(
      mergeMap((result) => {
        return this.setProfileAndTokens(result);
      }),
      catchError((err) => {
        console.error(err);
        return this.clearProfileAndTokens();
      }),
    );
  }

  clearProfileAndTokens() {
    return this.setProfileAndTokens({} as SsoUserAndTokens);
  }

  setProfileAndTokens(result: SsoUserAndTokens | undefined) {
    this.tokensService.setTokens(result?.tokens);
    return this.setProfile(result?.user);
  }

  setProfile(result: SsoUser | undefined) {
    this.profile$.next(result);
    return of(result);
  }

  getOAuthProviders() {
    return this.ssoConfiguration.oAuthProviders();
  }

  oAuthVerification(oAuthVerificationInput: OAuthVerificationInput) {
    return this.ssoConfiguration.oAuthVerification(oAuthVerificationInput);
  }
}
