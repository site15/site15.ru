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
  AuthConfiguration,
  AuthLoginInput,
  AuthSignupInput,
  AuthUpdateProfileInput,
  AuthUser,
  AuthUserAndTokens,
  FingerprintService,
  TokensService,
} from '@nestjs-mod-sso/auth-angular';
import { FilesService } from '@nestjs-mod-sso/files-angular';
import { catchError, from, map, mergeMap, Observable, of } from 'rxjs';
import { ActiveProjectService } from './active-project.service';

export class SsoAuthConfiguration implements AuthConfiguration {
  constructor(
    private readonly ssoRestService: SsoRestService,
    private readonly authRestService: AuthRestService,
    private readonly filesService: FilesService,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService,
    private readonly activeProjectService: ActiveProjectService,
    private readonly fingerprintService: FingerprintService
  ) {
    ssoRestService.configuration.withCredentials = true;
  }

  logout(): Observable<void | null> {
    const refreshToken = this.tokensService.getRefreshToken();
    return from(
      this.ssoRestService.ssoControllerSignOut({
        refreshToken,
      })
    ).pipe(
      map(() => {
        this.tokensService.setTokens({});
      })
    );
  }

  getProfile(): Observable<AuthUser | undefined> {
    return from(this.ssoRestService.ssoControllerProfile()).pipe(
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
    phone_number: string | null;
    email: string;
    id: string;
    preferred_username: string;
    roles: string[];
    picture: string | null;
  } {
    return {
      phone_number: result.phone,
      email: result.email,
      id: result.id,
      preferred_username: result.username || '',
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
          firstname: data.given_name,
          gender: data.gender,
          lastname: data.family_name,
          picture: data.picture,
          password: data.new_password,
          confirmPassword: data.confirm_new_password,
          oldPassword: data.old_password,
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
            refreshToken,
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
    const { confirm_password, password, email, nickname } = data;
    if (!email) {
      throw new Error('email not set');
    }
    if (!confirm_password) {
      throw new Error('confirm_password not set');
    }
    if (!password) {
      throw new Error('password not set');
    }
    return this.fingerprintService.getFingerprint().pipe(
      mergeMap((fingerprint) =>
        from(
          this.ssoRestService.ssoControllerSignUp({
            email,
            fingerprint,
            password,
            username: nickname,
            confirmPassword: confirm_password,
          })
        ).pipe(
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
        from(
          this.ssoRestService.ssoControllerSignIn({
            email,
            fingerprint,
            password,
          })
        ).pipe(
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

    if (!this.tokensService.getAccessToken()) {
      return {
        'Accept-language': lang,
        ...this.activeProjectService.getAuthorizationHeaders(),
      };
    }
    return {
      ...(this.tokensService.getAccessToken()
        ? { Authorization: `Bearer ${this.tokensService.getAccessToken()}` }
        : {}),
      'Accept-language': lang,
      ...this.activeProjectService.getAuthorizationHeaders(),
    };
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
      ActiveProjectService,
      FingerprintService,
    ],
  };
}
