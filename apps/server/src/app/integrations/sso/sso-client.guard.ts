import { AuthModule, AuthRequest } from '@nestjs-mod-sso/auth';
import { FilesRequest, FilesRole } from '@nestjs-mod-sso/files';
import {
  SsoError,
  SsoModule,
  SsoProjectService,
  SsoRequest,
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

@Injectable()
export class SsoClientGuard implements CanActivate {
  private logger = new Logger(SsoClientGuard.name);

  constructor(
    private readonly webhookUsersService: WebhookUsersService,
    private readonly ssoTokensService: SsoTokensService,
    private readonly ssoUsersService: SsoUsersService,
    private readonly ssoProjectService: SsoProjectService
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
