import {
  NOTIFICATIONS_FEATURE,
  NotificationsModule,
  NotificationsRequest,
} from '@nestjs-mod-sso/notifications';
import {
  SsoCheckIsAdmin,
  SsoGuard,
  SsoModule,
  SsoRequest,
} from '@nestjs-mod-sso/sso';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { ExecutionContext } from '@nestjs/common';

export function notificationsModuleForRootAsyncOptions(): Parameters<
  typeof NotificationsModule.forRootAsync
>[0] {
  return {
    imports: [
      SsoModule.forFeature({
        featureModuleName: NOTIFICATIONS_FEATURE,
      }),
    ],
    staticConfiguration: {
      guards: [SsoGuard],
      mutateController: (ctrl) => {
        SsoCheckIsAdmin()(ctrl);
        return ctrl;
      },
    },
    configuration: {
      checkAccessValidator: async (ctx: ExecutionContext) => {
        const req = getRequestFromExecutionContext(ctx) as SsoRequest &
          NotificationsRequest;
        req.notificationIsAdmin = Boolean(req.ssoIsAdmin);
        req.externalTenantId = req.ssoProject?.id;
      },
    },
  };
}
