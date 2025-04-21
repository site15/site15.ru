import {
  AUTH_FEATURE,
  AUTH_MODULE,
  AuthConfiguration,
  AuthModule,
  AuthRequest,
  AuthUser,
} from '@nestjs-mod-sso/auth';
import { searchIn, splitIn } from '@nestjs-mod-sso/common';
import { FilesRequest, FilesRole } from '@nestjs-mod-sso/files';
import {
  SSO_FEATURE,
  SsoAdminService,
  SsoCacheService,
  SsoError,
  SsoErrorEnum,
  SsoModule,
  SsoProjectService,
  SsoRequest,
  SsoRole,
  SsoStaticEnvironments,
  SsoTokensService,
  SsoUsersService,
} from '@nestjs-mod-sso/sso';
import {
  WebhookModule,
  WebhookRequest,
  WebhookUsersService,
} from '@nestjs-mod-sso/webhook';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { InjectPrismaClient, PrismaModule } from '@nestjs-mod/prisma';
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/sso-client';
import { WebhookRole } from '@prisma/webhook-client';

@Injectable()
export class AuthIntegrationConfiguration implements AuthConfiguration {
  private logger = new Logger(AuthIntegrationConfiguration.name);

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly ssoService: SsoUsersService,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly webhookUsersService: WebhookUsersService,
    private readonly ssoTokensService: SsoTokensService,
    private readonly ssoUsersService: SsoUsersService,
    private readonly ssoProjectService: SsoProjectService,
    private readonly ssoAdminService: SsoAdminService,
    private readonly ssoCacheService: SsoCacheService
  ) {}

  async checkAccessValidator(
    authUser?: AuthUser | null,
    ctx?: ExecutionContext
  ) {
    const req: SsoRequest & WebhookRequest & FilesRequest & AuthRequest = ctx
      ? getRequestFromExecutionContext(ctx)
      : {};

    if (
      typeof ctx?.getClass === 'function' &&
      typeof ctx?.getHandler === 'function' &&
      ctx?.getClass().name === 'TerminusHealthCheckController' &&
      ctx?.getHandler().name === 'check'
    ) {
      req.skipEmptyAuthUser = true;
    }

    if (!req.ssoProject) {
      req.ssoProject = await this.ssoProjectService.getProjectByRequest(req);
    }

    if (!req.ssoUser?.id) {
      const token = req.headers?.authorization?.split(' ')[1];

      if (token && token !== 'undefined') {
        // check user in sso
        try {
          const tokenData =
            await this.ssoTokensService.verifyAndDecodeAccessToken(token);
          if (!tokenData?.userId) {
            throw new SsoError('tokenData.userId not set');
          }
          if (!tokenData?.projectId) {
            this.logger.debug({ tokenData });
          }
          const getProfileResult = await this.ssoUsersService.getById({
            id: tokenData.userId,
            projectId: tokenData.projectId,
          });

          req.ssoProject = getProfileResult.SsoProject;

          req.ssoUser = getProfileResult;
        } catch (err) {
          this.logger.error(err, err.stack);
          req.ssoUser = undefined;
        }
      }
    }

    req.externalTenantId = req.ssoProject?.id;

    if (req?.ssoUser?.id) {
      req.externalUserId = req.ssoUser?.id;

      // webhook
      const webhookUserRole = searchIn(req.ssoUser?.roles, [
        ...(this.ssoStaticEnvironments.adminDefaultRoles || []),
      ])
        ? WebhookRole.Admin
        : searchIn(req.ssoUser?.roles, [
            ...(this.ssoStaticEnvironments.managerDefaultRoles || []),
          ])
        ? WebhookRole.User
        : undefined;
      if (webhookUserRole) {
        req.webhookUser = await this.webhookUsersService.createUserIfNotExists({
          externalUserId: req?.ssoUser?.id,
          externalTenantId: req?.ssoProject?.id,
          userRole: webhookUserRole,
        });
        req.webhookUser.userRole = webhookUserRole;
      }

      // files
      req.filesUser = {
        userRole: searchIn(req.ssoUser?.roles, SsoRole.admin)
          ? FilesRole.Admin
          : FilesRole.User,
      };

      if (req.ssoUser?.email && req.ssoUser?.roles) {
        req.externalUser = {
          email: req.ssoUser.email,
          roles: splitIn(req.ssoUser.roles),
        };
      }

      req.skipEmptyAuthUser = true;
    }

    if (
      this.ssoAdminService.checkAdminInRequest(req) ||
      searchIn(req.ssoUser?.roles, this.ssoStaticEnvironments.adminDefaultRoles)
    ) {
      req.skipEmptyAuthUser = true;
    }
  }

  async createAdmin(user: {
    username?: string;
    password: string;
    email: string;
  }): Promise<void | null> {
    try {
      const signupUserResult = await this.ssoService.create({
        user: {
          username: user.username,
          password: user.password,
          email: user.email.toLowerCase(),
        },
        roles: this.ssoStaticEnvironments.adminDefaultRoles,
      });

      await this.prismaClient.ssoUser.update({
        data: { emailVerifiedAt: new Date() },
        where: {
          id: signupUserResult.id,
        },
      });

      await this.ssoCacheService.clearCacheByUserId({
        userId: signupUserResult.id,
      });

      this.logger.debug(
        `Admin with email: ${signupUserResult.email} successfully created!`
      );
    } catch (err) {
      if (
        !(err instanceof SsoError && err.code === SsoErrorEnum.EmailIsExists)
      ) {
        this.logger.error(err, err.stack);
      }
    }
  }
}

export function authModuleForRootAsyncOptions(): Parameters<
  typeof AuthModule.forRootAsync
>[0] {
  return {
    imports: [
      SsoModule.forFeature({
        featureModuleName: AUTH_MODULE,
      }),
      PrismaModule.forFeature({
        contextName: SSO_FEATURE,
        featureModuleName: AUTH_MODULE,
      }),
      PrismaModule.forFeature({
        contextName: AUTH_FEATURE,
        featureModuleName: AUTH_FEATURE,
      }),
      WebhookModule.forFeature({
        featureModuleName: AUTH_MODULE,
      }),
    ],
    configurationClass: AuthIntegrationConfiguration,
  };
}
