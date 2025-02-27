import { TwoFactorCodeDto } from './generated/rest/dto/two-factor-code.dto';
import { TwoFactorUserDto } from './generated/rest/dto/two-factor-user.dto';

export enum TwoFactorEventEnum {
  GenerateCode = 'GenerateCode',
  ValidateCodeEachAttempt = 'ValidateCodeEachAttempt',
  ValidateCodeMaxAttempt = 'ValidateCodeMaxAttempt',
}

export interface TwoFactorEventContext {
  [TwoFactorEventEnum.GenerateCode]: {
    twoFactorUser: TwoFactorUserDto;
    twoFactorCode: TwoFactorCodeDto;
    code: string;
    repetition: boolean;
  };
  [TwoFactorEventEnum.ValidateCodeEachAttempt]: {
    twoFactorUser: TwoFactorUserDto;
    twoFactorCode: TwoFactorCodeDto;
    code: string;
    attempt: number;
    timeout: number;
  };
  [TwoFactorEventEnum.ValidateCodeMaxAttempt]: {
    twoFactorUser: TwoFactorUserDto;
    twoFactorCode: TwoFactorCodeDto;
    code: string;
    attempt: number;
    maxAttempt: number;
    timeout: number;
  };
  serviceId: string;
  type: string;
  operationName: string;
  externalUserId: string;
  externalTenantId: string;
}
