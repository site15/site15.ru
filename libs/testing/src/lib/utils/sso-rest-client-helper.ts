import { FilesRestSdkService } from '@nestjs-mod/files';
import { NotificationsRestSdkService } from '@nestjs-mod/notifications';
import {
  SsoProject,
  SsoRestSdkService,
  SsoRole,
  SsoUserDto,
  TokensResponse,
  WebhookUser,
} from '@nestjs-mod/sso-rest-sdk';
import { WebhookRestSdkService } from '@nestjs-mod/webhook';
import { Observable, finalize } from 'rxjs';
import WebSocket from 'ws';
import {
  GenerateRandomUserResult,
  generateRandomUser,
} from './generate-random-user';
import { getUrls } from './get-urls';

export class SsoRestClientHelper<T extends 'strict' | 'no_strict' = 'strict'> {
  ssoTokensResponse?: TokensResponse;

  private webhookProfile?: WebhookUser;
  private ssoProfile?: SsoUserDto;

  randomUser: T extends 'strict'
    ? GenerateRandomUserResult
    : GenerateRandomUserResult | undefined;

  private projectHelper?: SsoRestClientHelper<'strict'>;
  private project?: SsoProject;

  private ssoRestSdkService!: SsoRestSdkService;
  private webhookRestSdkService!: WebhookRestSdkService;
  private filesRestSdkService!: FilesRestSdkService;
  private notificationsRestSdkService!: NotificationsRestSdkService;

  constructor(
    private readonly options?: {
      serverUrl?: string;
      randomUser?: GenerateRandomUserResult;
      activeLang?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      headers?: any;
      skipCreateProjectHelper?: boolean;
    }
  ) {
    this.randomUser = options?.randomUser as GenerateRandomUserResult;

    this.createApiClients();
    this.setAuthorizationHeadersFromAuthorizationTokens();
  }

  private createApiClients() {
    this.ssoRestSdkService = new SsoRestSdkService({
      ...this.options,
      serverUrl: this.getServerUrl(),
    });
    this.webhookRestSdkService = new WebhookRestSdkService({
      ...this.options,
      serverUrl: this.getServerUrl(),
    });
    this.filesRestSdkService = new FilesRestSdkService({
      ...this.options,
      serverUrl: this.getServerUrl(),
    });
    this.notificationsRestSdkService = new NotificationsRestSdkService({
      ...this.options,
      serverUrl: this.getServerUrl(),
    });

    if (!this.options?.skipCreateProjectHelper) {
      this.projectHelper = new SsoRestClientHelper({
        ...(this.options?.headers ? { headers: this.options.headers } : {}),
        skipCreateProjectHelper: true,
      });
    }
  }

  private getServerUrl(): string {
    return this.options?.serverUrl || getUrls().serverUrl;
  }

  getSsoApi() {
    return this.ssoRestSdkService.getSsoApi();
  }

  getTimeApi() {
    return this.ssoRestSdkService.getTimeApi();
  }

  getWebhookApi() {
    return this.webhookRestSdkService.getWebhookApi();
  }

  getFilesApi() {
    return this.filesRestSdkService.getFilesApi();
  }

  getNotificationsApi() {
    return this.notificationsRestSdkService.getNotificationsApi();
  }

  getWebhookProfile() {
    return this.webhookProfile;
  }

  getSsoProfile() {
    return this.ssoProfile;
  }

  webSocket<T>({
    path,
    eventName,
    options,
  }: {
    path: string;
    eventName: string;
    options?: WebSocket.ClientOptions;
  }) {
    const headers = {
      ...(options?.headers || {}),
      ...this.getAuthorizationHeaders(),
    };
    const wss = new WebSocket(
      this.getServerUrl().replace('/api', '').replace('http', 'ws') + path,
      {
        ...(options || {}),
        headers,
      }
    );
    return new Observable<{ data: T; event: string }>((observer) => {
      wss.on('open', () => {
        wss.on('message', (data) => {
          observer.next(JSON.parse(data.toString()));
        });
        wss.on('error', (err) => {
          observer.error(err);
          if (wss?.readyState == WebSocket.OPEN) {
            wss.close();
          }
        });
        wss.send(
          JSON.stringify({
            event: eventName,
            data: true,
          })
        );
      });
    }).pipe(
      finalize(() => {
        if (wss?.readyState == WebSocket.OPEN) {
          wss.close();
        }
      })
    );
  }

  getGeneratedRandomUser(): Required<GenerateRandomUserResult> {
    if (!this.randomUser) {
      throw new Error('this.randomUser not set');
    }
    return this.randomUser as Required<GenerateRandomUserResult>;
  }

  async setRoles(userId: string, roles: SsoRole[]) {
    await this.ssoRestSdkService
      .getSsoApi()
      .ssoUsersControllerUpdateOne(userId, {
        roles: roles.map((r) => r.toLowerCase()).join(','),
      });

    return this;
  }

  async createAndLoginAsUser(
    options?: Pick<GenerateRandomUserResult, 'email' | 'password'>
  ) {
    await this.generateRandomUser(options);
    await this.reg();
    await this.login(options);

    return this;
  }

  async generateRandomUser(
    options?: Pick<GenerateRandomUserResult, 'email' | 'password'> | undefined
  ) {
    if (!this.randomUser || options) {
      this.randomUser = await generateRandomUser(undefined, options);
    }

    if (this.projectHelper) {
      await this.projectHelper.generateRandomUser();
    }

    return this;
  }

  async reg() {
    if (!this.randomUser) {
      this.randomUser = await generateRandomUser();
    }

    if (this.projectHelper) {
      if (!this.project) {
        const { data: createOneResult } =
          await this.projectHelper.ssoRestSdkService
            .getSsoApi()
            .ssoProjectsControllerCreateOne(
              {
                public: false,
                name: this.projectHelper.randomUser.uniqId,
                clientId: this.projectHelper.randomUser.id,
                clientSecret: this.projectHelper.randomUser.password,
              },
              {
                headers: {
                  'x-admin-secret':
                    process.env['SINGLE_SIGN_ON_SSO_ADMIN_SECRET'],
                },
              }
            );
        this.project = createOneResult;
      }

      const { data: signUpResult } = await this.ssoRestSdkService
        .getSsoApi()
        .ssoControllerSignUp(
          {
            username: this.randomUser.username,
            email: this.randomUser.email,
            password: this.randomUser.password,
            confirmPassword: this.randomUser.password,
            fingerprint: this.randomUser.id,
          },
          {
            headers: {
              'x-client-id': this.project.clientId,
            },
          }
        );

      this.ssoTokensResponse = signUpResult;

      const { data: findManyResult } =
        await this.projectHelper.ssoRestSdkService
          .getSsoApi()
          .ssoUsersControllerFindMany(
            undefined,
            undefined,
            this.randomUser.email,
            undefined,
            undefined,
            {
              headers: {
                'x-admin-secret':
                  process.env['SINGLE_SIGN_ON_SSO_ADMIN_SECRET'],
              },
            }
          );

      await this.projectHelper.ssoRestSdkService
        .getSsoApi()
        .ssoUsersControllerUpdateOne(
          findManyResult.ssoUsers[0].id,
          {
            emailVerifiedAt: new Date().toISOString(),
          },
          {
            headers: {
              'x-admin-secret': process.env['SINGLE_SIGN_ON_SSO_ADMIN_SECRET'],
            },
          }
        );
    }

    this.setAuthorizationHeadersFromAuthorizationTokens();

    await this.loadProfile();

    return this;
  }

  async login(
    options?: Partial<
      Pick<GenerateRandomUserResult, 'id' | 'email' | 'password'>
    >
  ) {
    if (!this.randomUser) {
      this.randomUser = await generateRandomUser();
    }
    const loginOptions = {
      email: options?.email || this.randomUser.email,
      password: options?.password || this.randomUser.password,
      id: options?.id || this.randomUser.id,
    };

    if (this.projectHelper) {
      const { data: loginResult } = await this.ssoRestSdkService
        .getSsoApi()
        .ssoControllerSignIn({
          email: loginOptions.email,
          fingerprint: loginOptions.id,
          password: loginOptions.password,
        });

      this.ssoTokensResponse = loginResult;

      this.setAuthorizationHeadersFromAuthorizationTokens();

      await this.loadProfile();

      return this;
    }
    throw new Error('Fatal');
  }

  private async loadProfile() {
    this.webhookProfile = (
      await this.webhookRestSdkService
        .getWebhookApi()
        .webhookControllerProfile()
    ).data;

    this.ssoProfile = (
      await this.ssoRestSdkService.getSsoApi().ssoControllerProfile()
    ).data;
  }

  async logout() {
    if (this.projectHelper) {
      await this.ssoRestSdkService.getSsoApi().ssoControllerSignOut({
        refreshToken: this.getRefreshToken(),
      });
      this.ssoTokensResponse = undefined;

      this.setAuthorizationHeadersFromAuthorizationTokens();

      await this.loadProfile();

      return this;
    }
    return this;
  }

  getRefreshToken(): string | undefined {
    return this.ssoTokensResponse?.refreshToken;
  }

  private setAuthorizationHeadersFromAuthorizationTokens() {
    this.ssoRestSdkService.updateHeaders(this.getAuthorizationHeaders());
    this.webhookRestSdkService.updateHeaders(this.getAuthorizationHeaders());
    this.filesRestSdkService.updateHeaders(this.getAuthorizationHeaders());
    this.notificationsRestSdkService.updateHeaders(
      this.getAuthorizationHeaders()
    );
  }

  getAuthorizationHeaders() {
    const accessToken = this.getAccessToken();
    return {
      ...this.options?.headers,
      ...(this.projectHelper?.randomUser?.id
        ? {
            'x-client-id': this.projectHelper.randomUser.id,
          }
        : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(this.options?.activeLang
        ? { ['Accept-Language']: this.options?.activeLang }
        : {}),
    };
  }

  getAccessToken() {
    return this.ssoTokensResponse?.accessToken;
  }
}
