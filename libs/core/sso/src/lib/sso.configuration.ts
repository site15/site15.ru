import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';
import { SsoUser } from './generated/rest/dto/sso-user.entity';
import { randomUUID } from 'node:crypto';

export type SsoSendNotificationOptions = {
  senderUser?: SsoUser;
  recipientUsers: SsoUser[];
  subject: string;
  html: string;
  text?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
  projectId: string;
};

export type SsoTwoFactorCodeValidateOptions = {
  code: string;
  projectId: string;
};

export type SsoTwoFactorCodeGenerateOptions = {
  user: SsoUser;
};

export type SsoTwoFactorCodeValidateResponse = {
  userId: string;
};

export type SsoSendNotificationResponse = {
  notificationId: string;
};

@ConfigModel()
export class SsoConfiguration {
  @ConfigModelProperty({
    description: 'TTL for cached data',
    default: 15_000,
  })
  cacheTTL?: number;

  @ConfigModelProperty({
    description:
      'The name of the header key that stores the register client ID',
    default: 'x-client-id',
  })
  clientIdHeaderName?: string;

  @ConfigModelProperty({
    description:
      'The name of the header key that stores the register client secret',
    default: 'x-client-secret',
  })
  clientSecretHeaderName?: string;

  @ConfigModelProperty({
    description: 'The name of the header key that stores the admin secret key',
    default: 'x-admin-secret',
  })
  adminSecretHeaderName?: string;

  @ConfigModelProperty({
    description: 'Function for generating two-factor authentication code',
    default: (options: SsoTwoFactorCodeGenerateOptions) =>
      Buffer.from(options.user.id).toString('hex'),
  })
  twoFactorCodeGenerate?: (
    options: SsoTwoFactorCodeGenerateOptions
  ) => Promise<string>;

  @ConfigModelProperty({
    description: 'Two-factor authentication code verification function',
    default: (options: SsoTwoFactorCodeValidateOptions) =>
      Buffer.from(options.code, 'hex').toString(),
  })
  twoFactorCodeValidate?: (
    options: SsoTwoFactorCodeValidateOptions
  ) => Promise<SsoTwoFactorCodeValidateResponse>;

  @ConfigModelProperty({
    description: 'Function for sending notifications',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    default: (options: SsoSendNotificationOptions) => randomUUID(),
  })
  sendNotification?: (
    options: SsoSendNotificationOptions
  ) => Promise<SsoSendNotificationResponse>;
}
