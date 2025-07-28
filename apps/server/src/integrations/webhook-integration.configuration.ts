import { PrismaModule } from '@nestjs-mod/prisma';
import { WEBHOOK_FEATURE, WebhookModule } from '@nestjs-mod/webhook';
import { SSO_FEATURE, SsoModule } from '@site15/sso';
import { TranslatesModule } from 'nestjs-translates';

export function webhookModuleForRootAsyncOptions(): Parameters<typeof WebhookModule.forRootAsync>[0] {
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
    configuration: {
      syncMode: false,
    },
  };
}
