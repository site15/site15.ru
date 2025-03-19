import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';
import { Type } from '@nestjs/common';
import { SsoUser } from './generated/rest/dto/sso-user.entity';

export enum SsoSendNotificationOptionsOperationName {
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  COMPLETE_FORGOT_PASSWORD = 'COMPLETE_FORGOT_PASSWORD',
}

export enum SsoTwoFactorCodeOptionsOperationName {
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  COMPLETE_FORGOT_PASSWORD = 'COMPLETE_FORGOT_PASSWORD',
}

export type SsoSendNotificationOptions = {
  senderUser?: SsoUser;
  recipientUsers: SsoUser[];
  subject: string;
  html: string;
  text?: string;
  projectId: string;
  operationName: SsoSendNotificationOptionsOperationName;
};

export type SsoTwoFactorCodeValidateOptions = {
  code: string;
  projectId: string;
  operationName: SsoTwoFactorCodeOptionsOperationName;
};

export type SsoTwoFactorCodeGenerateOptions = {
  user: SsoUser;
  operationName: SsoTwoFactorCodeOptionsOperationName;
};

export type SsoTwoFactorCodeValidateResponse = {
  userId: string;
};

export type SsoSendNotificationResponse = {
  recipientGroupId: string;
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
  })
  sendNotification?: (
    options: SsoSendNotificationOptions
  ) => Promise<SsoSendNotificationResponse | null>;

  @ConfigModelProperty({
    description: 'Default public projects',
  })
  defaultPublicProjects?: {
    name: string;
    clientId: string;
    clientSecret: string;
  }[];
}

@ConfigModel()
export class SsoStaticConfiguration {
  @ConfigModelProperty({
    description: 'Function for additional mutation of controllers',
  })
  mutateController?: (ctrl: Type) => Type;
}
