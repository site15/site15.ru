import { SkipAuthGuard } from '@nestjs-mod-sso/auth';
import {
  NotificationsModule,
  NotificationsService,
  SendNotificationOptionsType,
} from '@nestjs-mod-sso/notifications';
import {
  SsoConfiguration,
  SsoModule,
  SsoSendNotificationOptions,
  SsoTwoFactorCodeGenerateOptions,
  SsoTwoFactorCodeValidateOptions,
} from '@nestjs-mod-sso/sso';
import { TwoFactorModule, TwoFactorService } from '@nestjs-mod-sso/two-factor';
import { Injectable } from '@nestjs/common';
import { APP_FEATURE } from '../app/app.constants';

@Injectable()
export class SsoIntegrationConfiguration implements SsoConfiguration {
  constructor(
    private readonly twoFactorService: TwoFactorService,
    private readonly notificationsService: NotificationsService
  ) {}

  async sendNotification(options: SsoSendNotificationOptions) {
    return await this.notificationsService.sendNotification({
      externalTenantId: options.projectId,
      html: options.html,
      operationName: options.operationName,
      recipients: options.recipientUsers.map((recipientUser) => ({
        externalUserId: recipientUser.id,
        email: recipientUser.email || undefined,
        phone: recipientUser.phone || undefined,
        name:
          recipientUser.firstname && recipientUser.lastname
            ? `${recipientUser.firstname} ${recipientUser.lastname}`
            : undefined,
      })),
      subject: options.subject,
      type: options.recipientUsers[0].phoneVerifiedAt
        ? SendNotificationOptionsType.phone
        : SendNotificationOptionsType.email,
      sender: options.senderUser
        ? {
            externalUserId: options.senderUser.id,
            email: options.senderUser.email || undefined,
            phone: options.senderUser.phone || undefined,
            name:
              options.senderUser.firstname && options.senderUser.lastname
                ? `${options.senderUser.firstname} ${options.senderUser.lastname}`
                : undefined,
          }
        : undefined,
      text: options.text,
    });
  }

  async twoFactorCodeGenerate(options: SsoTwoFactorCodeGenerateOptions) {
    const generatedCode = await this.twoFactorService.generateCode({
      externalTenantId: options.user.projectId,
      externalUserId: options.user.id,
      operationName: options.operationName,
      type: options.user.phoneVerifiedAt ? 'phone' : 'email',
    });
    return generatedCode.code;
  }

  async twoFactorCodeValidate(options: SsoTwoFactorCodeValidateOptions) {
    const validatedCode = await this.twoFactorService.validateCode({
      externalTenantId: options.projectId,
      operationName: options.operationName,
      code: options.code,
    });
    return {
      userId: validatedCode.twoFactorUser.externalUserId,
    };
  }
}

export function ssoModuleForRootAsyncOptions(): Parameters<
  typeof SsoModule.forRootAsync
>[0] {
  return {
    staticConfiguration: {
      mutateController: (ctrl) => {
        SkipAuthGuard()(ctrl);
        return ctrl;
      },
    },
    imports: [
      TwoFactorModule.forFeature({ featureModuleName: APP_FEATURE }),
      NotificationsModule.forFeature({ featureModuleName: APP_FEATURE }),
    ],
    inject: [TwoFactorService, NotificationsService],
    configurationClass: SsoIntegrationConfiguration,
  };
}
