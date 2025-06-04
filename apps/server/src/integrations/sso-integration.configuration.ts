import {
  SSO_FEATURE,
  SSO_MODULE,
  SsoConfiguration,
  SsoModule,
  SsoRequest,
  SsoRole,
  SsoSendNotificationOptions,
  SsoTwoFactorCodeGenerateOptions,
  SsoTwoFactorCodeValidateOptions,
  SsoUser,
} from '@nestjs-mod-sso/sso';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { FilesRequest, FilesRole } from '@nestjs-mod/files';
import { searchIn } from '@nestjs-mod/misc';
import {
  NotificationsModule,
  NotificationsService,
  SendNotificationOptionsType,
} from '@nestjs-mod/notifications';
import { PrismaModule } from '@nestjs-mod/prisma';
import { TwoFactorModule, TwoFactorService } from '@nestjs-mod/two-factor';
import {
  WebhookModule,
  WebhookPrismaSdk,
  WebhookRequest,
  WebhookUsersService,
} from '@nestjs-mod/webhook';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { APP_FEATURE } from '../app/app.constants';

@Injectable()
export class SsoIntegrationConfiguration implements SsoConfiguration {
  constructor(
    private readonly webhookUsersService: WebhookUsersService,
    private readonly twoFactorService: TwoFactorService,
    private readonly notificationsService: NotificationsService
  ) {}

  async checkAccessValidator(
    authUser?: SsoUser | null,
    ctx?: ExecutionContext
  ) {
    const req: SsoRequest & WebhookRequest & FilesRequest = ctx
      ? getRequestFromExecutionContext(ctx)
      : {};

    if (
      typeof ctx?.getClass === 'function' &&
      typeof ctx?.getHandler === 'function' &&
      ctx?.getClass().name === 'TerminusHealthCheckController' &&
      ctx?.getHandler().name === 'check'
    ) {
      req.skipEmptySsoUser = true;
    }

    req.externalTenantId = req.ssoProject?.id;

    if (req?.ssoUser?.id) {
      req.externalUserId = req.ssoUser?.id;

      // webhook
      const webhookUserRole = searchIn(req.ssoUser?.roles, SsoRole.admin)
        ? WebhookPrismaSdk.WebhookRole.Admin
        : searchIn(req.ssoUser?.roles, SsoRole.manager)
        ? WebhookPrismaSdk.WebhookRole.User
        : undefined;
      if (webhookUserRole) {
        // todo: create in sso module options for local events and use event with name sign-up for run this logic
        req.webhookUser = await this.webhookUsersService.createUserIfNotExists({
          externalUserId: req?.ssoUser?.id,
          externalTenantId: req?.ssoProject?.id,
          userRole: webhookUserRole,
        });
        req.webhookUser.userRole = webhookUserRole;
      }

      // files
      req.filesUser = {
        userRole: searchIn(req.ssoUser?.roles, SsoRole.admin)
          ? FilesRole.Admin
          : FilesRole.User,
      };
    }
  }

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
      externalUsername: options.user.username || undefined,
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
    imports: [
      SsoModule.forFeature({
        featureModuleName: SSO_MODULE,
      }),
      PrismaModule.forFeature({
        contextName: SSO_FEATURE,
        featureModuleName: SSO_MODULE,
      }),
      WebhookModule.forFeature({
        featureModuleName: SSO_MODULE,
      }),

      TwoFactorModule.forFeature({ featureModuleName: APP_FEATURE }),
      NotificationsModule.forFeature({ featureModuleName: APP_FEATURE }),
    ],
    inject: [TwoFactorService, NotificationsService],
    configurationClass: SsoIntegrationConfiguration,
  };
}
