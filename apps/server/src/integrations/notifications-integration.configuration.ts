import {
  NOTIFICATIONS_FEATURE,
  NotificationsModule,
  NotificationsRequest,
} from '@nestjs-mod/notifications';
import {
  CheckSsoRole,
  SsoGuard,
  SsoModule,
  SsoRequest,
  SsoRole,
} from '@nestjs-mod-sso/sso';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { searchIn } from '@nestjs-mod/misc';
import { ExecutionContext } from '@nestjs/common';
import { TranslatesModule } from 'nestjs-translates';

export function notificationsModuleForRootAsyncOptions(): Parameters<
  typeof NotificationsModule.forRootAsync
>[0] {
  return {
    imports: [
      SsoModule.forFeature({
        featureModuleName: NOTIFICATIONS_FEATURE,
      }),
      TranslatesModule,
    ],
    staticConfiguration: {
      guards: [SsoGuard],
      mutateController: (ctrl) => {
        CheckSsoRole([SsoRole.admin])(ctrl);
        return ctrl;
      },
    },
    configuration: {
      checkAccessValidator: async (ctx: ExecutionContext) => {
        const req = getRequestFromExecutionContext(ctx) as SsoRequest &
          NotificationsRequest;
        req.notificationIsAdmin = searchIn(SsoRole.admin, req.ssoUser?.roles);
        req.externalTenantId = req.ssoProject?.id;
      },
    },
  };
}
