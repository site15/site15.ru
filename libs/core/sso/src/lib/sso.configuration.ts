import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';
import { SsoUser } from './generated/rest/dto/sso-user.entity';
import { randomUUID } from 'node:crypto';

export type SendNotificationOptions = {
  senderUser?: SsoUser;
  recipientUsers: SsoUser[];
  subject: string;
  html: string;
  text?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
  projectId: string;
};

export type TwoFactorCodeValidateOptions = {
  code: string;
  projectId: string;
};

export type TwoFactorCodeGenerateOptions = {
  user: SsoUser;
};

export type TwoFactorCodeValidateResponse = {
  userId: string;
};

export type SendNotificationResponse = {
  notificationId: string;
};

@ConfigModel()
export class SsoStaticConfiguration {
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
    default: (options: TwoFactorCodeGenerateOptions) =>
      Buffer.from(options.user.id).toString('hex'),
  })
  twoFactorCodeGenerate?: (
    options: TwoFactorCodeGenerateOptions
  ) => Promise<string>;

  @ConfigModelProperty({
    description: 'Two-factor authentication code verification function',
    default: (options: TwoFactorCodeValidateOptions) =>
      Buffer.from(options.code, 'hex').toString(),
  })
  twoFactorCodeValidate?: (
    options: TwoFactorCodeValidateOptions
  ) => Promise<TwoFactorCodeValidateResponse>;

  @ConfigModelProperty({
    description: 'Function for sending notifications',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    default: (options: SendNotificationOptions) => randomUUID(),
  })
  sendNotification?: (
    options: SendNotificationOptions
  ) => Promise<SendNotificationResponse>;
}
