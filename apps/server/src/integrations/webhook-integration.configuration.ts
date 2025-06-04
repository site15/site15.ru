import {
  CheckSsoRole,
  SSO_FEATURE,
  SsoGuard,
  SsoModule,
  SsoRole,
} from '@nestjs-mod-sso/sso';
import { WEBHOOK_FEATURE, WebhookModule } from '@nestjs-mod/webhook';
import { PrismaModule } from '@nestjs-mod/prisma';
import { TranslatesModule } from 'nestjs-translates';

export function webhookModuleForRootAsyncOptions(): Parameters<
  typeof WebhookModule.forRootAsync
>[0] {
  return {
    imports: [
      SsoModule.forFeature({
        featureModuleName: WEBHOOK_FEATURE,
      }),
      PrismaModule.forFeature({
        featureModuleName: WEBHOOK_FEATURE,
        contextName: SSO_FEATURE,
      }),
      TranslatesModule,
    ],
    staticConfiguration: {
      guards: [SsoGuard],
      mutateController: (ctrl) => {
        CheckSsoRole([SsoRole.user, SsoRole.admin, SsoRole.manager])(ctrl);
        return ctrl;
      },
    },
    configuration: {
      syncMode: false,
    },
  };
}
