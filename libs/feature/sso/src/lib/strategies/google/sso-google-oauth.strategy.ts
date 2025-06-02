import { isInfrastructureMode } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaToolsService } from '@nestjs-mod/prisma-tools';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Request } from 'express';
import { render } from 'mustache';
import { randomUUID } from 'node:crypto';
import passport from 'passport';
import {
  GoogleCallbackParameters,
  Profile,
  Strategy,
  VerifyCallback,
} from 'passport-google-oauth20';
import {
  PrismaClient,
  SsoOAuthProvider,
  SsoOAuthProviderSettings,
} from '../../generated/prisma-client';
import { SsoService } from '../../services/sso.service';
import { SSO_FEATURE } from '../../sso.constants';
import { SsoStaticEnvironments } from '../../sso.environments';
import { SsoRequest } from '../../types/sso-request';

// https://console.cloud.google.com/apis/credentials
// https://myaccount.google.com/permissions
// http://localhost:3000/api/sso/oauth/google?redirect_uri=https%3A%2F%2Fsso.nestjs-mod.com%2Fapi%2Fsso%2Foauth%2Fgoogle%2Fredirect%3Fclient_id%3DOceX08HGZ89PTkPpg9KDk5ErY1uMfDcfFKkw
// http://localhost:3000/complete-oauth-sign-up?verification_code=d4315edf-5460-450f-b133-0eba62c79605
@Injectable()
export class SsoGoogleOAuthStrategy implements OnModuleInit {
  static oauthProviderName = 'google';
  readonly oauthProviderName = 'google';

  private logger = new Logger(SsoGoogleOAuthStrategy.name);

  private readonly clientIDKey = 'GOOGLE_OAUTH_CLIENT_ID';
  private readonly clientSecretKey = 'GOOGLE_OAUTH_CLIENT_SECRET_KEY';

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly ssoService: SsoService,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments
  ) {}

  public async getProvider(): Promise<
    | (SsoOAuthProvider & {
        SsoOAuthProviderSettings: SsoOAuthProviderSettings[];
      })
    | null
  > {
    try {
      return await this.prismaClient.ssoOAuthProvider.findFirstOrThrow({
        where: { name: this.oauthProviderName },
        include: { SsoOAuthProviderSettings: true },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (this.prismaToolsService.isErrorOfRecordNotFound(err)) {
        try {
          const googleOauthClientId =
            this.ssoStaticEnvironments.googleOauthClientId;
          const googleOauthClientSecretKey =
            this.ssoStaticEnvironments.googleOauthClientSecretKey;

          return await this.prismaClient.ssoOAuthProvider.create({
            include: { SsoOAuthProviderSettings: true },
            data: {
              name: this.oauthProviderName,
              SsoOAuthProviderSettings: {
                create: [
                  {
                    name: this.clientIDKey,
                    value: googleOauthClientId || '',
                  },
                  {
                    name: this.clientSecretKey,
                    value: googleOauthClientSecretKey || '',
                  },
                ],
              },
            },
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          if (
            this.prismaToolsService.isErrorOfUniqueField<SsoOAuthProvider>(
              err,
              'name',
              true
            )
          ) {
            return null;
          }
          throw err;
        }
      }
      throw err;
    }
  }

  async onModuleInit() {
    this.logger.debug('onModuleInit');

    if (isInfrastructureMode()) {
      return;
    }

    const options = await this.getProviderOptions();
    if (!options) {
      this.logger.warn('Options not set');
      return;
    }

    passport.use(
      this.oauthProviderName,
      new Strategy(
        { ...options, passReqToCallback: true },
        (
          req: Request,
          accessToken: string,
          refreshToken: string,
          params: GoogleCallbackParameters,
          profile: Profile,
          done: VerifyCallback
        ) => {
          this.verify({
            req,
            accessToken,
            refreshToken,
            profile,
            providerId: options.providerId,
          })
            .then((result) => done(null, result))
            .catch((err) => done(err, undefined));
        }
      )
    );
  }

  private async verify({
    req,
    accessToken,
    refreshToken,
    profile,
    providerId,
  }: {
    req: Request;
    accessToken: string;
    refreshToken: string;
    profile: Profile;
    providerId: string;
  }) {
    const projectId = (req as unknown as SsoRequest).ssoProject?.id;
    const verificationCode = randomUUID();
    this.logger.debug(JSON.stringify({ projectId, profile, verificationCode }));
    if (!profile.id) {
      return undefined;
    }
    try {
      const oAuthToken = await this.prismaClient.ssoOAuthToken.findFirstOrThrow(
        {
          include: {
            SsoUser: {
              select: {
                picture: true,
                firstname: true,
                lastname: true,
              },
            },
          },
          where: {
            providerUserId: String(profile.id),
            providerId,
          },
        }
      );
      const user = await this.prismaClient.ssoUser.update({
        where: {
          id: oAuthToken.userId,
        },
        data: {
          picture:
            oAuthToken.SsoUser.picture ||
            (profile.photos &&
              profile.photos.length &&
              profile.photos[0].value) ||
            null,
          firstname:
            oAuthToken.SsoUser.firstname || profile.name?.givenName || null,
          lastname:
            oAuthToken.SsoUser.lastname || profile.name?.familyName || null,
        },
      });
      await this.prismaClient.ssoOAuthToken.update({
        where: {
          id: oAuthToken.id,
        },
        data: {
          accessToken,
          refreshToken,
          verificationCode,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          providerUserData: profile as any,
        },
      });
      return { ...user, verificationCode };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (this.prismaToolsService.isErrorOfRecordNotFound(err)) {
        const username =
          (profile.displayName &&
            profile.displayName.split(' ').join('_').toLowerCase()) ||
          `${this.oauthProviderName}_${profile.id}`;
        const email =
          (profile.emails &&
            profile.emails.length &&
            profile.emails[0]?.value) ||
          `${this.oauthProviderName}_${profile.id}`;

        const password = `${this.oauthProviderName}_${profile.id}`;

        try {
          const user = await this.prismaClient.ssoUser.findFirstOrThrow({
            where: { email, projectId },
          });
          await this.prismaClient.ssoOAuthToken.create({
            data: {
              accessToken,
              refreshToken,
              providerUserId: String(profile.id),
              providerId,
              projectId,
              userId: user.id,
              verificationCode,
            },
          });
          return { ...user, verificationCode };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          this.logger.error(err, err.stack);
          if (this.prismaToolsService.isErrorOfRecordNotFound(err)) {
            const user = await this.ssoService.autoSignUp({
              projectId,
              email,
              password,
              username,
              picture:
                (profile.photos &&
                  profile.photos.length &&
                  profile.photos[0].value) ||
                undefined,
              firstname: profile.name?.givenName || undefined,
              lastname: profile.name?.familyName || undefined,
            });
            await this.prismaClient.ssoOAuthToken.create({
              data: {
                accessToken,
                refreshToken,
                providerUserId: String(profile.id),
                providerId,
                projectId,
                userId: user.id,
                verificationCode,
              },
            });
            return { ...user, verificationCode };
          }
          throw err;
        }
      }
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  public async getProviderOptions(): Promise<{
    providerId: string;
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope: string[];
  } | null> {
    const domain = this.ssoStaticEnvironments.serverUrl;
    const redirectUrl = '{{{domain}}}/api/sso/oauth/{{providerName}}/redirect';
    const provider = await this.getProvider();

    if (!provider) {
      return null;
    }
    const context = {
      providerName: provider?.name,
      domain,
    };

    const ssoOAuthProviderSettings = provider.SsoOAuthProviderSettings || [];
    const clientID =
      ssoOAuthProviderSettings.find((s) => s.name === this.clientIDKey)
        ?.value || '';
    const clientSecret =
      ssoOAuthProviderSettings.find((s) => s.name === this.clientSecretKey)
        ?.value || '';

    if (!clientID || !clientSecret) {
      return null;
    }

    try {
      const callbackURL = render(redirectUrl, context);
      return {
        providerId: provider.id,
        clientID,
        clientSecret,
        callbackURL,
        scope: ['email', 'profile'],
      };
    } catch (err) {
      throw Error(
        `Error in render callbackURL from template: "${redirectUrl}",  context: "${context}"`
      );
    }
  }
}
