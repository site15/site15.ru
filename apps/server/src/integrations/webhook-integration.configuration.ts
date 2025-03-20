import { AuthModule, AUTH_FEATURE } from '@nestjs-mod-sso/auth';
import {
  WEBHOOK_FEATURE,
  WebhookConfiguration,
  WebhookModule,
} from '@nestjs-mod-sso/webhook';
import { PrismaModule } from '@nestjs-mod/prisma';
import { getText } from 'nestjs-translates';

export class WebhookIntegrationConfiguration implements WebhookConfiguration {
  syncMode = false;
  events = [
    {
      eventName: 'app-demo.create',
      description: getText('Event that will be triggered after creation'),
      example: {
        id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
        name: 'demo name',
        createdAt: '2024-10-02T18:49:07.992Z',
        updatedAt: '2024-10-02T18:49:07.992Z',
      },
    },
    {
      eventName: 'app-demo.update',
      description: getText('Event that will trigger after the update'),
      example: {
        id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
        name: 'demo name',
        createdAt: '2024-10-02T18:49:07.992Z',
        updatedAt: '2024-10-02T18:49:07.992Z',
      },
    },
    {
      eventName: 'app-demo.delete',
      description: getText('Event that will fire after deletion'),
      example: {
        id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
        name: 'demo name',
        createdAt: '2024-10-02T18:49:07.992Z',
        updatedAt: '2024-10-02T18:49:07.992Z',
      },
    },
  ];
}

export function webhookModuleForRootAsyncOptions(): Parameters<
  typeof WebhookModule.forRootAsync
>[0] {
  return {
    staticEnvironments: {
      searchUserIdInHeaders: false,
      searchTenantIdInHeaders: false,
    },
    imports: [
      AuthModule.forFeature({ featureModuleName: AUTH_FEATURE }),
      PrismaModule.forFeature({
        featureModuleName: WEBHOOK_FEATURE,
        contextName: AUTH_FEATURE,
      }),
    ],
    configurationClass: WebhookIntegrationConfiguration,
  };
}
