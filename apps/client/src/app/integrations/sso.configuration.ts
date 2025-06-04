import { Provider } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { FilesService } from '@nestjs-mod/files-afat';
import {
  SsoRestSdkAngularService,
  SsoUserDtoInterface,
  TokensResponseInterface,
} from '@nestjs-mod/sso-rest-sdk-angular';
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
} from '@nestjs-mod-sso/sso-afat';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, map, mergeMap, Observable, of } from 'rxjs';

export class SsoIntegrationConfiguration implements SsoConfiguration {
  constructor(
    private readonly ssoRestSdkAngularService: SsoRestSdkAngularService,
    private readonly filesService: FilesService,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService,
    private readonly ssoActiveProjectService: SsoActiveProjectService,
    private readonly fingerprintService: FingerprintService,
    private readonly nzMessageService: NzMessageService
  ) {}

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
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoOAuthControllerOauthProviders();
  }

  oAuthVerification({
    verificationCode,
    clientId,
  }: OAuthVerificationInput): Observable<SsoUserAndTokens> {
    return this.fingerprintService.getFingerprint().pipe(
      mergeMap((fingerprint) =>
        this.ssoRestSdkAngularService
          .getSsoApi()
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
    return this.ssoRestSdkAngularService
      .getSsoApi()
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
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoControllerProfile()
      .pipe(
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
    timezone: number | null;
  } {
    return {
      phoneNumber: result.phone,
      email: result.email,
      id: result.id,
      preferredUsername: result.username || '',
      roles: result.roles ? result.roles.split(',') : [],
      picture: result.picture,
      timezone: result.timezone,
    };
  }

  updateProfile(data: SsoUpdateProfileInput): Observable<void | null> {
    const oldData = data;
    return (
      data.picture
        ? this.filesService.getPresignedUrlAndUploadFile(data.picture)
        : of('')
    ).pipe(
      catchError((err) => {
        console.error(err);
        this.nzMessageService.error(
          this.translocoService.translate('Error while saving image')
        );
        return of(undefined);
      }),
      mergeMap((picture) => {
        return this.ssoRestSdkAngularService
          .getSsoApi()
          .ssoControllerUpdateProfile({
            birthdate: data.birthdate,
            firstname: data.givenName,
            gender: data.gender,
            lastname: data.familyName,
            picture,
            password: data.newPassword,
            confirmPassword: data.confirmNewPassword,
            oldPassword: data.oldPassword,
            timezone: data.timezone,
          });
      }),
      mergeMap(() =>
        this.ssoRestSdkAngularService.getSsoApi().ssoControllerProfile()
      ),
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
        this.ssoRestSdkAngularService
          .getSsoApi()
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
        this.ssoRestSdkAngularService
          .getSsoApi()
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
        this.ssoRestSdkAngularService
          .getSsoApi()
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
        this.ssoRestSdkAngularService
          .getSsoApi()
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
        this.ssoRestSdkAngularService
          .getSsoApi()
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
    return this.ssoRestSdkAngularService
      .getSsoApi()
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
      SsoRestSdkAngularService,
      FilesService,
      TranslocoService,
      TokensService,
      SsoActiveProjectService,
      FingerprintService,
      NzMessageService,
    ],
  };
}
