import { Provider } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  AuthRestService,
  SsoRestService,
  SsoUserDtoInterface,
  TokensResponseInterface,
} from '@nestjs-mod-sso/app-angular-rest-sdk';
import {
  AUTH_CONFIGURATION_TOKEN,
  AuthCompleteForgotPasswordInput,
  AuthCompleteSignUpInput,
  AuthConfiguration,
  AuthForgotPasswordInput,
  AuthLoginInput,
  AuthSignupInput,
  AuthUpdateProfileInput,
  AuthUser,
  AuthUserAndTokens,
  FingerprintService,
  TokensService,
} from '@nestjs-mod-sso/auth-angular';
import { FilesService } from '@nestjs-mod-sso/files-angular';
import { SsoActiveProjectService } from '@nestjs-mod-sso/sso-angular';
import { catchError, map, mergeMap, Observable, of } from 'rxjs';

export class SsoAuthConfiguration implements AuthConfiguration {
  constructor(
    private readonly ssoRestService: SsoRestService,
    private readonly authRestService: AuthRestService,
    private readonly filesService: FilesService,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService,
    private readonly ssoActiveProjectService: SsoActiveProjectService,
    private readonly fingerprintService: FingerprintService
  ) {
    ssoRestService.configuration.withCredentials = true;
  }

  getOAuthProviders() {
    return this.ssoRestService.ssoOAuthControllerOauthProviders();
  }

  logout(): Observable<void | null> {
    const refreshToken = this.tokensService.getRefreshToken();
    return this.ssoRestService
      .ssoControllerSignOut(
        refreshToken
          ? {
              refreshToken,
            }
          : {}
      )
      .pipe(
        map(() => {
          this.tokensService.setTokens({});
        })
      );
  }

  getProfile(): Observable<AuthUser | undefined> {
    return this.ssoRestService.ssoControllerProfile().pipe(
      map((result) => {
        return this.mapToAuthUser(result);
      })
    );
  }

  private mapToAuthTokens(tokens: TokensResponseInterface) {
    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  private mapToAuthUser(result: SsoUserDtoInterface): {
    phoneNumber: string | null;
    email: string;
    id: string;
    preferredUsername: string;
    roles: string[];
    picture: string | null;
  } {
    return {
      phoneNumber: result.phone,
      email: result.email,
      id: result.id,
      preferredUsername: result.username || '',
      roles: result.roles ? result.roles.split(',') : [],
      picture: result.picture,
    };
  }

  updateProfile(data: AuthUpdateProfileInput): Observable<void | null> {
    const oldData = data;
    return (
      data.picture
        ? this.filesService.getPresignedUrlAndUploadFile(data.picture)
        : of('')
    ).pipe(
      mergeMap((picture) =>
        this.authRestService
          .authControllerProfile()
          .pipe(map((profile) => ({ ...profile, picture })))
      ),
      catchError(() => of(null)),
      mergeMap((profile) => {
        if (data && profile) {
          data = { ...data, ...profile };
        }
        return this.ssoRestService.ssoControllerUpdateProfile({
          birthdate: data.birthdate,
          firstname: data.givenName,
          gender: data.gender,
          lastname: data.familyName,
          picture: data.picture,
          password: data.newPassword,
          confirmPassword: data.confirmNewPassword,
          oldPassword: data.oldPassword,
        });
      }),
      mergeMap(() => this.ssoRestService.ssoControllerProfile()),
      mergeMap((newData) => {
        if (
          oldData?.picture &&
          typeof oldData?.picture === 'string' &&
          (newData as AuthUpdateProfileInput)?.picture !== oldData.picture
        ) {
          return this.filesService
            .deleteFile(oldData.picture)
            .pipe(map(() => newData));
        }
        return of(newData);
      }),
      map(() => null)
    );
  }

  refreshToken(): Observable<AuthUserAndTokens | undefined> {
    const refreshToken = this.tokensService.getRefreshToken();
    return this.fingerprintService.getFingerprint().pipe(
      mergeMap((fingerprint) =>
        this.ssoRestService
          .ssoControllerRefreshTokens({
            ...(refreshToken
              ? {
                  refreshToken,
                }
              : {}),
            fingerprint,
          })
          .pipe(
            map((result: TokensResponseInterface) => ({
              tokens: this.mapToAuthTokens(result),
              user: this.mapToAuthUser(result.user),
            }))
          )
      )
    );
  }

  signup(data: AuthSignupInput): Observable<AuthUserAndTokens> {
    const { confirmPassword, password, email, nickname } = data;
    if (!email) {
      throw new Error('email not set');
    }
    if (!confirmPassword) {
      throw new Error('confirmPassword not set');
    }
    if (!password) {
      throw new Error('password not set');
    }
    return this.fingerprintService.getFingerprint().pipe(
      mergeMap((fingerprint) =>
        this.ssoRestService
          .ssoControllerSignUp({
            email,
            fingerprint,
            password,
            username: nickname,
            confirmPassword: confirmPassword,
          })
          .pipe(
            map((result) => ({
              tokens: this.mapToAuthTokens(result),
              user: this.mapToAuthUser(result.user),
            }))
          )
      )
    );
  }

  login(data: AuthLoginInput): Observable<AuthUserAndTokens> {
    const { password, email } = data;
    if (!email) {
      throw new Error('email not set');
    }
    return this.fingerprintService.getFingerprint().pipe(
      mergeMap((fingerprint) =>
        this.ssoRestService
          .ssoControllerSignIn({
            email,
            fingerprint,
            password,
          })
          .pipe(
            map((result) => ({
              tokens: this.mapToAuthTokens(result),
              user: this.mapToAuthUser(result.user),
            }))
          )
      )
    );
  }

  getAuthorizationHeaders(): Record<string, string> {
    const lang = this.translocoService.getActiveLang();
    const accessToken = this.tokensService.getAccessToken();
    const activeProjectAuthorizationHeaders =
      this.ssoActiveProjectService.getAuthorizationHeaders();
    if (!accessToken) {
      return {
        'Accept-language': lang,
        ...activeProjectAuthorizationHeaders,
      };
    }
    return {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'Accept-language': lang,
      ...activeProjectAuthorizationHeaders,
    };
  }

  completeSignUp(data: AuthCompleteSignUpInput): Observable<AuthUserAndTokens> {
    const { code } = data;
    if (!code) {
      throw new Error('code not set');
    }
    return this.fingerprintService.getFingerprint().pipe(
      mergeMap((fingerprint) =>
        this.ssoRestService
          .ssoControllerCompleteSignUp({
            code,
            fingerprint,
          })
          .pipe(
            map((result) => ({
              tokens: this.mapToAuthTokens(result),
              user: this.mapToAuthUser(result.user),
            }))
          )
      )
    );
  }

  completeForgotPassword(
    data: AuthCompleteForgotPasswordInput
  ): Observable<AuthUserAndTokens> {
    const { password, confirmPassword: confirmPassword, code } = data;
    if (!password) {
      throw new Error('password not set');
    }
    if (!confirmPassword) {
      throw new Error('confirmPassword not set');
    }
    if (!code) {
      throw new Error('code not set');
    }
    return this.fingerprintService.getFingerprint().pipe(
      mergeMap((fingerprint) =>
        this.ssoRestService
          .ssoControllerCompleteForgotPassword({
            password,
            confirmPassword,
            code,
            fingerprint,
          })
          .pipe(
            map((result) => ({
              tokens: this.mapToAuthTokens(result),
              user: this.mapToAuthUser(result.user),
            }))
          )
      )
    );
  }

  forgotPassword(data: AuthForgotPasswordInput): Observable<true> {
    const { email, redirectUri: redirectUri } = data;
    if (!email) {
      throw new Error('email not set');
    }
    return this.ssoRestService
      .ssoControllerForgotPassword({
        email,
        redirectUri,
      })
      .pipe(map(() => true));
  }
}

export function provideSsoAuthConfiguration(): Provider {
  return {
    provide: AUTH_CONFIGURATION_TOKEN,
    useClass: SsoAuthConfiguration,
    deps: [
      SsoRestService,
      AuthRestService,
      FilesService,
      TranslocoService,
      TokensService,
      SsoActiveProjectService,
      FingerprintService,
    ],
  };
}
