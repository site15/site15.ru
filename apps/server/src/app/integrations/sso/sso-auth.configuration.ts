import { AuthConfiguration, AuthRequest, AuthUser } from '@nestjs-mod-sso/auth';
import { FilesRequest, FilesRole } from '@nestjs-mod-sso/files';
import {
  SSO_FEATURE,
  SsoError,
  SsoProjectService,
  SsoRequest,
  SsoStaticEnvironments,
  SsoTokensService,
  SsoUsersService,
} from '@nestjs-mod-sso/sso';
import { WebhookUsersService, WebhookRequest } from '@nestjs-mod-sso/webhook';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/sso-client';

@Injectable()
export class SsoAuthConfiguration implements AuthConfiguration {
  private logger = new Logger(SsoAuthConfiguration.name);

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly ssoService: SsoUsersService,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly webhookUsersService: WebhookUsersService,
    private readonly ssoTokensService: SsoTokensService,
    private readonly ssoUsersService: SsoUsersService,
    private readonly ssoProjectService: SsoProjectService
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

      if (token) {
        // check user in sso
        try {
          const tokenData =
            await this.ssoTokensService.verifyAndDecodeAccessToken(token);
          if (!tokenData?.userId) {
            throw new SsoError('tokenData.userId not set');
          }
          const getProfileResult = await this.ssoUsersService.getById({
            id: tokenData.userId,
            projectId: req.ssoProject.id,
          });

          req.ssoUser = getProfileResult;
        } catch (err) {
          this.logger.error(err, err.stack);
          req.ssoUser = undefined;
        }
      }
    }

    if (req?.ssoUser?.id) {
      // common
      // req.externalUserId = req.ssoUser.id;
      // req.externalTenantId = req.ssoProject.id;

      // webhook
      req.webhookUser = await this.webhookUsersService.createUserIfNotExists({
        externalUserId: req?.ssoUser?.id,
        externalTenantId: req?.ssoProject?.id,
        userRole: req.ssoUser?.roles?.split(',').includes('admin')
          ? 'Admin'
          : 'User',
      });

      if (req.webhookUser) {
        req.externalUserId = req.webhookUser.externalUserId;
        req.externalTenantId = req.webhookUser.externalTenantId;
      }

      // files
      req.filesUser = {
        userRole:
          req.webhookUser?.userRole === 'Admin'
            ? FilesRole.Admin
            : FilesRole.User,
      };

      if (req.ssoUser?.email && req.ssoUser?.roles) {
        req.externalUser = {
          email: req.ssoUser.email,
          role: req.ssoUser.roles?.split(',')?.[0],
        };
      }

      req.skipEmptyAuthUser = true;
    }
  }

  async createAdmin(user: {
    username?: string;
    password: string;
    email: string;
  }): Promise<void | null> {
    if (
      this.ssoStaticEnvironments.defaultClientId &&
      this.ssoStaticEnvironments.defaultClientSecret
    ) {
      const adminProject = await this.prismaClient.ssoProject.upsert({
        create: {
          clientId: this.ssoStaticEnvironments.defaultClientId,
          clientSecret: this.ssoStaticEnvironments.defaultClientSecret,
        },
        update: {},
        where: { clientId: this.ssoStaticEnvironments.defaultClientId },
      });

      try {
        const signupUserResult = await this.ssoService.create({
          user: {
            username: user.username,
            password: user.password,
            email: user.email.toLowerCase(),
          },
          projectId: adminProject.id,
        });

        await this.prismaClient.ssoUser.update({
          data: { roles: 'admin', emailVerifiedAt: new Date() },
          where: {
            email_projectId: {
              email: user.email,
              projectId: adminProject.id,
            },
          },
        });
        this.logger.debug(
          `Admin with email: ${signupUserResult.email} successfully created!`
        );
      } catch (err) {
        this.logger.error(err, err.stack);
      }
    }
  }
}
