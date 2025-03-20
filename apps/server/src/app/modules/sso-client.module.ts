import { AuthModule, AuthRequest } from '@nestjs-mod-sso/auth';
import { searchIn, splitIn } from '@nestjs-mod-sso/common';
import { FilesRequest, FilesRole } from '@nestjs-mod-sso/files';
import {
  SsoAdminService,
  SsoError,
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
import {
  createNestModule,
  getRequestFromExecutionContext,
} from '@nestjs-mod/common';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { WebhookRole } from '@prisma/webhook-client';

@Injectable()
export class SsoClientGuard implements CanActivate {
  private logger = new Logger(SsoClientGuard.name);

  constructor(
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly webhookUsersService: WebhookUsersService,
    private readonly ssoTokensService: SsoTokensService,
    private readonly ssoUsersService: SsoUsersService,
    private readonly ssoProjectService: SsoProjectService,
    private readonly ssoAdminService: SsoAdminService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return await this.tryGetOrCreateCurrentUserWithExternalUserId(context);
  }

  private async tryGetOrCreateCurrentUserWithExternalUserId(
    context: ExecutionContext
  ) {
    const req: SsoRequest & WebhookRequest & FilesRequest & AuthRequest =
      getRequestFromExecutionContext(context);

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
            this.logger.debug({
              tryGetOrCreateCurrentUserWithExternalUserId: { token, tokenData },
            });
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

        if (req.webhookUser) {
          req.externalUserId = req.webhookUser.externalUserId;
          req.externalTenantId = req.webhookUser.externalTenantId;
        }
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

    return true;
  }
}

export const { SsoClientModule } = createNestModule({
  moduleName: 'SsoClientModule',
  imports: [
    SsoModule.forFeature({ featureModuleName: 'SSO_CLIENT_FEATURE' }),
    WebhookModule.forFeature({ featureModuleName: 'SSO_CLIENT_FEATURE' }),
    AuthModule.forFeature({ featureModuleName: 'SSO_CLIENT_FEATURE' }),
  ],
  providers: [{ provide: APP_GUARD, useClass: SsoClientGuard }],
});
