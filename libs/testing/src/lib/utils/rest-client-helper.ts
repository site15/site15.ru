import { FilesRestSdkService } from '@nestjs-mod/files';
import { NotificationsRestSdkService } from '@nestjs-mod/notifications';
import { SsoTenant, Site15RestSdkService, SsoRole, SsoUserDto, TokensResponse, WebhookUser } from '@site15/rest-sdk';
import { WebhookRestSdkService } from '@nestjs-mod/webhook';
import { Observable, finalize } from 'rxjs';
import WebSocket from 'ws';
import { GenerateRandomUserResult, generateRandomUser } from './generate-random-user';
import { getUrls } from './get-urls';

export class Site15RestClientHelper<T extends 'strict' | 'no_strict' = 'strict'> {
  ssoTokensResponse?: TokensResponse;

  private webhookProfile?: WebhookUser;
  private ssoProfile?: SsoUserDto;

  randomUser: T extends 'strict' ? GenerateRandomUserResult : GenerateRandomUserResult | undefined;

  private tenantHelper?: Site15RestClientHelper<'strict'>;
  private tenant?: SsoTenant;

  private site15RestSdkService!: Site15RestSdkService;
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
      skipCreateTenantHelper?: boolean;
    },
  ) {
    this.randomUser = options?.randomUser as GenerateRandomUserResult;

    this.createApiClients();
    this.setAuthorizationHeadersFromAuthorizationTokens();
  }

  private createApiClients() {
    this.site15RestSdkService = new Site15RestSdkService({
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

    if (!this.options?.skipCreateTenantHelper) {
      this.tenantHelper = new Site15RestClientHelper({
        ...(this.options?.headers ? { headers: this.options.headers } : {}),
        skipCreateTenantHelper: true,
      });
    }
  }

  private getServerUrl(): string {
    return this.options?.serverUrl || getUrls().serverUrl;
  }

  getSsoApi() {
    return this.site15RestSdkService.getSsoApi();
  }

  getTimeApi() {
    return this.site15RestSdkService.getTimeApi();
  }

  getMetricsApi() {
    return this.site15RestSdkService.getMetricsApi();
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

  webSocket<T>({ path, eventName, options }: { path: string; eventName: string; options?: WebSocket.ClientOptions }) {
    const headers = {
      ...(options?.headers || {}),
      ...this.getAuthorizationHeaders(),
    };
    const wss = new WebSocket(this.getServerUrl().replace('/api', '').replace('http', 'ws') + path, {
      ...(options || {}),
      headers,
    });
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
          }),
        );
      });
    }).pipe(
      finalize(() => {
        if (wss?.readyState == WebSocket.OPEN) {
          wss.close();
        }
      }),
    );
  }

  getGeneratedRandomUser(): Required<GenerateRandomUserResult> {
    if (!this.randomUser) {
      throw new Error('this.randomUser not set');
    }
    return this.randomUser as Required<GenerateRandomUserResult>;
  }

  async setRoles(userId: string, roles: SsoRole[]) {
    await this.site15RestSdkService.getSsoApi().ssoUsersControllerUpdateOne(userId, {
      roles: roles.map((r) => r.toLowerCase()).join(','),
    });

    return this;
  }

  async createAndLoginAsUser(options?: Pick<GenerateRandomUserResult, 'email' | 'password'>) {
    await this.generateRandomUser(options);
    await this.reg();
    await this.login(options);

    return this;
  }

  async generateRandomUser(options?: Pick<GenerateRandomUserResult, 'email' | 'password'> | undefined) {
    if (!this.randomUser || options) {
      this.randomUser = await generateRandomUser(undefined, options);
    }

    if (this.tenantHelper) {
      await this.tenantHelper.generateRandomUser();
    }

    return this;
  }

  async reg() {
    if (!this.randomUser) {
      this.randomUser = await generateRandomUser();
    }

    if (this.tenantHelper) {
      if (!this.tenant) {
        const { data: createOneResult } = await this.tenantHelper.site15RestSdkService
          .getSsoApi()
          .ssoTenantsControllerCreateOne(
            {
              public: false,
              name: this.tenantHelper.randomUser.uniqId,
              clientId: this.tenantHelper.randomUser.id,
              clientSecret: this.tenantHelper.randomUser.password,
              enabled: true,
              slug: this.tenantHelper.randomUser.domainWord,
            },
            {
              headers: {
                'x-admin-secret': process.env['SITE_15_SSO_ADMIN_SECRET'],
              },
            },
          );
        this.tenant = createOneResult;
      }

      const { data: signUpResult } = await this.site15RestSdkService.getSsoApi().ssoControllerSignUp(
        {
          username: this.randomUser.username,
          email: this.randomUser.email,
          password: this.randomUser.password,
          confirmPassword: this.randomUser.password,
          fingerprint: this.randomUser.id,
        },
        {
          headers: {
            'x-client-id': this.tenant.clientId,
          },
        },
      );

      this.ssoTokensResponse = signUpResult;

      const { data: findManyResult } = await this.tenantHelper.site15RestSdkService
        .getSsoApi()
        .ssoUsersControllerFindMany(undefined, undefined, this.randomUser.email, undefined, undefined, {
          headers: {
            'x-admin-secret': process.env['SITE_15_SSO_ADMIN_SECRET'],
          },
        });

      const userId = findManyResult.ssoUsers[0].id;
      await this.verifyUser(userId);
    }

    this.setAuthorizationHeadersFromAuthorizationTokens();

    await this.loadProfile();

    return this;
  }

  private async verifyUser(userId: string) {
    if (!this.tenantHelper) {
      throw new Error('this.tenantHelper not set');
    }

    await this.tenantHelper.site15RestSdkService.getSsoApi().ssoUsersControllerUpdateOne(
      userId,
      {
        emailVerifiedAt: new Date().toISOString(),
      },
      {
        headers: {
          'x-admin-secret': process.env['SITE_15_SSO_ADMIN_SECRET'],
        },
      },
    );
  }

  async login(options?: Partial<Pick<GenerateRandomUserResult, 'id' | 'email' | 'password'>>) {
    if (!this.randomUser) {
      this.randomUser = await generateRandomUser();
    }
    const loginOptions = {
      email: options?.email || this.randomUser.email,
      password: options?.password || this.randomUser.password,
      id: options?.id || this.randomUser.id,
    };

    if (this.tenantHelper) {
      const { data: loginResult } = await this.site15RestSdkService.getSsoApi().ssoControllerSignIn({
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
    this.webhookProfile = (await this.webhookRestSdkService.getWebhookApi().webhookControllerProfile()).data;

    this.ssoProfile = (await this.site15RestSdkService.getSsoApi().ssoControllerProfile()).data;
  }

  async logout() {
    if (this.tenantHelper) {
      await this.site15RestSdkService.getSsoApi().ssoControllerSignOut({
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
    this.site15RestSdkService.updateHeaders(this.getAuthorizationHeaders());
    this.webhookRestSdkService.updateHeaders(this.getAuthorizationHeaders());
    this.filesRestSdkService.updateHeaders(this.getAuthorizationHeaders());
    this.notificationsRestSdkService.updateHeaders(this.getAuthorizationHeaders());
  }

  getAuthorizationHeaders() {
    const accessToken = this.getAccessToken();
    return {
      ...this.options?.headers,
      ...(this.tenantHelper?.randomUser?.id
        ? {
            'x-client-id': this.tenantHelper.randomUser.id,
          }
        : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(this.options?.activeLang ? { ['Accept-Language']: this.options?.activeLang } : {}),
    };
  }

  getAccessToken() {
    return this.ssoTokensResponse?.accessToken;
  }
}
