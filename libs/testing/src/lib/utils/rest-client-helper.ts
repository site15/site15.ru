import {
  RestSdkService,
  SsoProject,
  SsoRole,
  SsoUserDto,
  TokensResponse,
  WebhookUser,
} from '@nestjs-mod-sso/rest-sdk';
import {
  GenerateRandomUserResult,
  generateRandomUser,
} from './generate-random-user';
import { getUrls } from './get-urls';

export class RestClientHelper<
  T extends 'strict' | 'no_strict' = 'strict'
> extends RestSdkService {
  ssoTokensResponse?: TokensResponse;

  private webhookProfile?: WebhookUser;
  private ssoProfile?: SsoUserDto;

  randomUser: T extends 'strict'
    ? GenerateRandomUserResult
    : GenerateRandomUserResult | undefined;

  private projectHelper?: RestClientHelper<'strict'>;
  private project?: SsoProject;

  constructor(
    private readonly clientOptions?: {
      serverUrl?: string;
      randomUser?: GenerateRandomUserResult;
      activeLang?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      headers?: any;
      skipCreateProjectHelper?: boolean;
    }
  ) {
    super({
      headers: clientOptions?.headers,
      serverUrl: clientOptions?.serverUrl || getUrls().serverUrl,
    });
    this.randomUser = clientOptions?.randomUser as GenerateRandomUserResult;
    if (!clientOptions?.skipCreateProjectHelper) {
      this.projectHelper = new RestClientHelper({
        ...(clientOptions?.headers ? { headers: clientOptions.headers } : {}),
        skipCreateProjectHelper: true,
      });
    }
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

    this.updateHeaders(this.getAuthorizationHeaders());

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

      this.updateHeaders(this.getAuthorizationHeaders());

      await this.loadProfile();

      return this;
    }
    throw new Error('Fatal');
  }

  private async loadProfile() {
    if (this.getWebhookApi()) {
      this.webhookProfile = (
        await this.getWebhookApi().webhookControllerProfile()
      ).data;
    }

    if (this.getSsoApi()) {
      this.ssoProfile = (await this.getSsoApi().ssoControllerProfile()).data;
    }
  }

  async logout() {
    if (this.projectHelper) {
      await this.getSsoApi().ssoControllerSignOut({
        refreshToken: this.getRefreshToken(),
      });
      this.ssoTokensResponse = undefined;

      this.updateHeaders(this.getAuthorizationHeaders());

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
      ...this.clientOptions?.headers,
      ...(this.projectHelper?.randomUser?.id
        ? {
            'x-client-id': this.projectHelper.randomUser.id,
          }
        : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(this.clientOptions?.activeLang
        ? { ['Accept-Language']: this.clientOptions?.activeLang }
        : {}),
    };
  }

  getAccessToken() {
    return this.ssoTokensResponse?.accessToken;
  }
}
