import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';
import { ExecutionContext, Type } from '@nestjs/common';
import { SsoUser } from './generated/rest/dto/sso-user.entity';
import { SsoError, SsoErrorEnum } from './sso.errors';

export enum OperationName {
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  COMPLETE_FORGOT_PASSWORD = 'COMPLETE_FORGOT_PASSWORD',
  COMPLETE_REGISTRATION_USING_THE_INVITATION_LINK = 'COMPLETE_REGISTRATION_USING_THE_INVITATION_LINK',
}

export type SsoSendNotificationOptions = {
  senderUser?: SsoUser;
  recipientUsers: SsoUser[];
  subject: string;
  html: string;
  text?: string;
  tenantId: string;
  operationName: OperationName;
};

export type SsoTwoFactorCodeValidateOptions = {
  code: string;
  tenantId: string;
  operationName: OperationName;
};

export type SsoTwoFactorCodeGenerateOptions = {
  user: SsoUser;
  operationName: OperationName;
};

export type SsoTwoFactorCodeGenerateResponse = {
  user: SsoUser;
  operationName: OperationName;
  code: string;
  // seconds
  timeout: number;
};

export type SsoTwoFactorCodeValidateResponse = {
  userId: string;
};

export type SsoSendNotificationResponse = {
  recipientGroupId: string;
};

@ConfigModel()
export class SsoConfiguration {
  // header names
  @ConfigModelProperty({
    description: 'The name of the header key that stores the register client ID',
    default: 'x-client-id',
  })
  clientIdHeaderName?: string;

  @ConfigModelProperty({
    description: 'The name of the header key that stores the register client secret',
    default: 'x-client-secret',
  })
  clientSecretHeaderName?: string;

  @ConfigModelProperty({
    description: 'The name of the header key that stores the admin secret key',
    default: 'x-admin-secret',
  })
  adminSecretHeaderName?: string;

  // two factor
  @ConfigModelProperty({
    description: 'Function for generating two-factor authentication code',
    default: (options: SsoTwoFactorCodeGenerateOptions) => ({
      ...options,
      code: Buffer.from(options.user.id).toString('hex'),
      ttl: 0,
    }),
  })
  twoFactorCodeGenerate?: (options: SsoTwoFactorCodeGenerateOptions) => Promise<SsoTwoFactorCodeGenerateResponse>;

  @ConfigModelProperty({
    description: 'Two-factor authentication code verification function',
    default: (options: SsoTwoFactorCodeValidateOptions) => {
      try {
        return Buffer.from(options.code, 'hex').toString();
      } catch (error) {
        throw new SsoError(SsoErrorEnum.VerificationCodeNotFound);
      }
    },
  })
  twoFactorCodeValidate?: (options: SsoTwoFactorCodeValidateOptions) => Promise<SsoTwoFactorCodeValidateResponse>;

  // notification
  @ConfigModelProperty({
    description: 'Function for sending notifications',
  })
  sendNotification?: (options: SsoSendNotificationOptions) => Promise<SsoSendNotificationResponse | null>;

  // external validator
  @ConfigModelProperty({
    description: 'External function for validate permissions',
  })
  checkAccessValidator?: (authUser?: SsoUser | null, ctx?: ExecutionContext) => Promise<void>;
}

@ConfigModel()
export class SsoStaticConfiguration {
  @ConfigModelProperty({
    description: 'Function for additional mutation of controllers',
  })
  mutateController?: (ctrl: Type) => Type;
}
