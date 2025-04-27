import { Provider } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  SsoRestService,
  SsoUserDtoInterface,
  TokensResponseInterface,
} from '@nestjs-mod-sso/app-angular-rest-sdk';
import { FilesService } from '@nestjs-mod-sso/files-angular';
import {
  FingerprintService,
  OAuthProvider,
  OAuthVerificationInput,
  SSO_CONFIGURATION_TOKEN,
  SsoActiveProjectService,
  SsoCompleteForgotPasswordInput,
  SsoCompleteSignUpInput,
  SsoConfiguration,
  SsoForgotPasswordInput,
  SsoLoginInput,
  SsoSignupInput,
  SsoUpdateProfileInput,
  SsoUser,
  SsoUserAndTokens,
  TokensService,
} from '@nestjs-mod-sso/sso-angular';
import { catchError, map, mergeMap, Observable, of } from 'rxjs';

export class SsoIntegrationConfiguration implements SsoConfiguration {
  constructor(
    private readonly ssoRestService: SsoRestService,
    private readonly filesService: FilesService,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService,
    private readonly ssoActiveProjectService: SsoActiveProjectService,
    private readonly fingerprintService: FingerprintService
  ) {
    ssoRestService.configuration.withCredentials = true;
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

  oAuthProviders(): Observable<OAuthProvider[]> {
    return this.ssoRestService.ssoOAuthControllerOauthProviders();
  }

  oAuthVerification({
    verificationCode,
    clientId,
  }: OAuthVerificationInput): Observable<SsoUserAndTokens> {
    return this.fingerprintService.getFingerprint().pipe(
      mergeMap((fingerprint) =>
        this.ssoRestService
          .ssoOAuthControllerOauthVerification({
            fingerprint,
            verificationCode,
          })
          .pipe(
            map((result: TokensResponseInterface) => ({
              tokens: this.mapToSsoTokens(result),
              user: this.mapToSsoUser(result.user),
            }))
          )
      )
    );
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

  getProfile(): Observable<SsoUser | undefined> {
    return this.ssoRestService.ssoControllerProfile().pipe(
      map((result) => {
        return this.mapToSsoUser(result);
      })
    );
  }

  private mapToSsoTokens(tokens: TokensResponseInterface) {
    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  private mapToSsoUser(result: SsoUserDtoInterface): {
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

  updateProfile(data: SsoUpdateProfileInput): Observable<void | null> {
    const oldData = data;
    return (
      data.picture
        ? this.filesService.getPresignedUrlAndUploadFile(data.picture)
        : of('')
    ).pipe(
      mergeMap((picture) =>
        this.ssoRestService
          .ssoControllerProfile()
          .pipe(map((profile) => ({ ...profile, picture })))
      ),
      catchError(() => of(null)),
      mergeMap((profile) => {
        if (data && profile) {
          data = { ...data, ...(profile as SsoUpdateProfileInput) };
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
          (newData as SsoUpdateProfileInput)?.picture !== oldData.picture
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

  refreshToken(): Observable<SsoUserAndTokens | undefined> {
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
              tokens: this.mapToSsoTokens(result),
              user: this.mapToSsoUser(result.user),
            }))
          )
      )
    );
  }

  signup(data: SsoSignupInput): Observable<SsoUserAndTokens> {
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
              tokens: this.mapToSsoTokens(result),
              user: this.mapToSsoUser(result.user),
            }))
          )
      )
    );
  }

  login(data: SsoLoginInput): Observable<SsoUserAndTokens> {
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
              tokens: this.mapToSsoTokens(result),
              user: this.mapToSsoUser(result.user),
            }))
          )
      )
    );
  }

  completeSignUp(data: SsoCompleteSignUpInput): Observable<SsoUserAndTokens> {
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
              tokens: this.mapToSsoTokens(result),
              user: this.mapToSsoUser(result.user),
            }))
          )
      )
    );
  }

  completeForgotPassword(
    data: SsoCompleteForgotPasswordInput
  ): Observable<SsoUserAndTokens> {
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
              tokens: this.mapToSsoTokens(result),
              user: this.mapToSsoUser(result.user),
            }))
          )
      )
    );
  }

  forgotPassword(data: SsoForgotPasswordInput): Observable<true> {
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

export function provideSsoConfiguration(): Provider {
  return {
    provide: SSO_CONFIGURATION_TOKEN,
    useClass: SsoIntegrationConfiguration,
    deps: [
      SsoRestService,
      FilesService,
      TranslocoService,
      TokensService,
      SsoActiveProjectService,
      FingerprintService,
    ],
  };
}
