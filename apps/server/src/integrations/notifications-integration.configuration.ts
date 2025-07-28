import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { searchIn } from '@nestjs-mod/misc';
import { NOTIFICATIONS_FEATURE, NotificationsModule, NotificationsRequest } from '@nestjs-mod/notifications';
import { ExecutionContext } from '@nestjs/common';
import { SsoModule, SsoRequest, SsoRole } from '@site15/sso';
import { TranslatesModule } from 'nestjs-translates';

export function notificationsModuleForRootAsyncOptions(): Parameters<typeof NotificationsModule.forRootAsync>[0] {
  return {
    imports: [
      SsoModule.forFeature({
        featureModuleName: NOTIFICATIONS_FEATURE,
      }),
      TranslatesModule,
    ],
    configuration: {
      checkAccessValidator: async (ctx: ExecutionContext) => {
        const req = getRequestFromExecutionContext(ctx) as SsoRequest & NotificationsRequest;
        req.notificationIsAdmin = searchIn(SsoRole.admin, req.ssoUser?.roles);
        if (req.ssoTenant?.id) {
          req.externalTenantId = req.ssoTenant?.id;
        }
      },
    },
  };
}
