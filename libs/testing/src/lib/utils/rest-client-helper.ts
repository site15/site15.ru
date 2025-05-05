import {
  Configuration,
  FilesApi,
  NotificationsApi,
  SsoApi,
  SsoProject,
  SsoRole,
  SsoUserDto,
  TimeApi,
  TokensResponse,
  WebhookApi,
  WebhookUser,
} from '@nestjs-mod-sso/rest-sdk';
import axios, { AxiosInstance } from 'axios';
import { Observable, finalize } from 'rxjs';
import {
  GenerateRandomUserResult,
  generateRandomUser,
} from './generate-random-user';
import { getUrls } from './get-urls';

import WebSocket from 'ws';

export class RestClientHelper<T extends 'strict' | 'no_strict' = 'strict'> {
  ssoTokensResponse?: TokensResponse;

  private webhookProfile?: WebhookUser;
  private ssoProfile?: SsoUserDto;

  private ssoApi?: SsoApi;
  private webhookApi?: WebhookApi;
  private filesApi?: FilesApi;
  private timeApi?: TimeApi;
  private notificationsApi?: NotificationsApi;

  private webhookApiAxios?: AxiosInstance;
  private filesApiAxios?: AxiosInstance;
  private timeApiAxios?: AxiosInstance;
  private ssoApiAxios?: AxiosInstance;
  private notificationsApiAxios?: AxiosInstance;

  randomUser: T extends 'strict'
    ? GenerateRandomUserResult
    : GenerateRandomUserResult | undefined;

  private projectHelper?: RestClientHelper<'strict'>;
  private project?: SsoProject;

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
    if (!options?.skipCreateProjectHelper) {
      this.projectHelper = new RestClientHelper({
        ...(options?.headers ? { headers: options.headers } : {}),
        skipCreateProjectHelper: true,
      });
    }
    this.createApiClients();
    this.setAuthorizationHeadersFromAuthorizationTokens();
  }

  getWebhookProfile() {
    return this.webhookProfile;
  }

  getSsoProfile() {
    return this.ssoProfile;
  }

  getGeneratedRandomUser(): Required<GenerateRandomUserResult> {
    if (!this.randomUser) {
      throw new Error('this.randomUser not set');
    }
    return this.randomUser as Required<GenerateRandomUserResult>;
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

  getWebhookApi() {
    if (!this.webhookApi) {
      throw new Error('webhookApi not set');
    }
    return this.webhookApi;
  }

  getFilesApi() {
    if (!this.filesApi) {
      throw new Error('filesApi not set');
    }
    return this.filesApi;
  }

  getTimeApi() {
    if (!this.timeApi) {
      throw new Error('timeApi not set');
    }
    return this.timeApi;
  }

  getSsoApi() {
    if (!this.ssoApi) {
      throw new Error('ssoApi not set');
    }
    return this.ssoApi;
  }

  getNotificationsApi() {
    if (!this.notificationsApi) {
      throw new Error('notificationsApi not set');
    }
    return this.notificationsApi;
  }

  async setRoles(userId: string, roles: SsoRole[]) {
    await this.getSsoApi().ssoUsersControllerUpdateOne(userId, {
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
        const { data: createOneResult } = await this.projectHelper
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

      const { data: signUpResult } = await this.getSsoApi().ssoControllerSignUp(
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

      const { data: findManyResult } = await this.projectHelper
        .getSsoApi()
        .ssoUsersControllerFindMany(
          undefined,
          undefined,
          this.randomUser.email,
          undefined,
          this.project.id,
          {
            headers: {
              'x-admin-secret': process.env['SINGLE_SIGN_ON_SSO_ADMIN_SECRET'],
            },
          }
        );

      await this.projectHelper.getSsoApi().ssoUsersControllerUpdateOne(
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
      const { data: loginResult } = await this.getSsoApi().ssoControllerSignIn({
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
    if (this.webhookApi) {
      this.webhookProfile = (
        await this.getWebhookApi().webhookControllerProfile()
      ).data;
    }

    if (this.ssoApi) {
      this.ssoProfile = (await this.getSsoApi().ssoControllerProfile()).data;
    }

    if (this.ssoApi) {
      this.ssoProfile = (await this.getSsoApi().ssoControllerProfile()).data;
    }
  }

  private setAuthorizationHeadersFromAuthorizationTokens() {
    if (this.webhookApiAxios) {
      Object.assign(
        this.webhookApiAxios.defaults.headers.common,
        this.getAuthorizationHeaders()
      );
    }
    if (this.ssoApiAxios) {
      Object.assign(
        this.ssoApiAxios.defaults.headers.common,
        this.getAuthorizationHeaders()
      );
    }
    if (this.filesApiAxios) {
      Object.assign(
        this.filesApiAxios.defaults.headers.common,
        this.getAuthorizationHeaders()
      );
    }
    if (this.ssoApiAxios) {
      Object.assign(
        this.ssoApiAxios.defaults.headers.common,
        this.getAuthorizationHeaders()
      );
    }
    if (this.timeApiAxios) {
      Object.assign(
        this.timeApiAxios.defaults.headers.common,
        this.getAuthorizationHeaders()
      );
    }
    if (this.notificationsApiAxios) {
      Object.assign(
        this.notificationsApiAxios.defaults.headers.common,
        this.getAuthorizationHeaders()
      );
    }
  }

  async logout() {
    if (this.projectHelper) {
      await this.getSsoApi().ssoControllerSignOut({
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

  private createApiClients() {
    this.webhookApiAxios = axios.create();
    this.webhookApi = new WebhookApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.webhookApiAxios
    );
    //

    this.ssoApiAxios = axios.create();
    this.ssoApi = new SsoApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.ssoApiAxios
    );
    //

    this.filesApiAxios = axios.create();
    this.filesApi = new FilesApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.filesApiAxios
    );
    //

    this.timeApiAxios = axios.create();
    this.timeApi = new TimeApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.timeApiAxios
    );
    //

    this.ssoApiAxios = axios.create();
    this.ssoApi = new SsoApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.ssoApiAxios
    );
    //

    this.notificationsApiAxios = axios.create();
    this.notificationsApi = new NotificationsApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.notificationsApiAxios
    );
  }

  private getServerUrl(): string {
    return this.options?.serverUrl || getUrls().serverUrl;
  }
}
