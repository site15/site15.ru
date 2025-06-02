import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { getText } from 'nestjs-translates';

export enum SsoErrorEnum {
  COMMON = 'SSO-000',
  UserNotFound = 'SSO-001',
  WrongPassword = 'SSO-002',
  UserIsExists = 'SSO-003',
  ActivateEmailWrongCode = 'SSO-004',
  ActivateEmailNotProcessed = 'SSO-005',
  ActivateEmailProcessed = 'SSO-006',
  RefreshTokenNotProvided = 'SSO-007',
  SessionExpired = 'SSO-008',
  InvalidRefreshSession = 'SSO-009',
  AccessTokenExpired = 'SSO-010',
  EmailIsExists = 'SSO-011',
  EmailNotVerified = 'SSO-012',
  Forbidden = 'SSO-013',
  WrongOldPassword = 'SSO-014',
  NonExistentRoleSpecified = 'SSO-015',
  BadAccessToken = 'SSO-016',
  YourSessionHasBeenBlocked = 'SSO-017',
  VerificationCodeNotFound = 'SSO-018',
}

export const SSO_ERROR_ENUM_TITLES: Record<SsoErrorEnum, string> = {
  [SsoErrorEnum.COMMON]: getText('Sso error'),
  [SsoErrorEnum.UserNotFound]: getText('User not found'),
  [SsoErrorEnum.WrongPassword]: getText('Wrong password'),
  [SsoErrorEnum.UserIsExists]: getText('User is exists'),
  [SsoErrorEnum.ActivateEmailWrongCode]: getText('Wrong activate email code'),
  [SsoErrorEnum.ActivateEmailNotProcessed]: getText(
    'Activate email not processed'
  ),
  [SsoErrorEnum.ActivateEmailProcessed]: getText('Activate email processed'),
  [SsoErrorEnum.RefreshTokenNotProvided]: getText('Refresh token not provided'),
  [SsoErrorEnum.SessionExpired]: getText('Session expired'),
  [SsoErrorEnum.InvalidRefreshSession]: getText('Invalid refresh session'),
  [SsoErrorEnum.AccessTokenExpired]: getText('Access token expired'),
  [SsoErrorEnum.EmailIsExists]: getText('User is exists'),
  [SsoErrorEnum.EmailNotVerified]: getText('Email not verified'),
  [SsoErrorEnum.Forbidden]: getText('Forbidden'),
  [SsoErrorEnum.WrongOldPassword]: getText('Wrong old password'),
  [SsoErrorEnum.NonExistentRoleSpecified]: getText(
    'Non-existent role specified'
  ),
  [SsoErrorEnum.BadAccessToken]: getText('Bad access token'),
  [SsoErrorEnum.YourSessionHasBeenBlocked]: getText(
    'Your session has been blocked'
  ),
  [SsoErrorEnum.VerificationCodeNotFound]: getText(
    'Verification code not found'
  ),
};

export class SsoError<T = unknown> extends Error {
  @ApiProperty({
    type: String,
    description: Object.entries(SSO_ERROR_ENUM_TITLES)
      .map(([key, value]) => `${value} (${key})`)
      .join(', '),
    example: SSO_ERROR_ENUM_TITLES[SsoErrorEnum.COMMON],
  })
  override message: string;

  @ApiProperty({
    enum: SsoErrorEnum,
    enumName: 'SsoErrorEnum',
    example: SsoErrorEnum.COMMON,
  })
  code = SsoErrorEnum.COMMON;

  @ApiPropertyOptional({ type: Object })
  metadata?: T;

  constructor(
    message?: string | SsoErrorEnum,
    code?: SsoErrorEnum,
    metadata?: T
  ) {
    const messageAsCode = Boolean(
      message && Object.values(SsoErrorEnum).includes(message as SsoErrorEnum)
    );
    const preparedCode = messageAsCode ? (message as SsoErrorEnum) : code;
    const preparedMessage =
      messageAsCode && preparedCode
        ? SSO_ERROR_ENUM_TITLES[preparedCode]
        : message;

    code = preparedCode || SsoErrorEnum.COMMON;
    message = preparedMessage || SSO_ERROR_ENUM_TITLES[code];

    super(message);

    this.code = code;
    this.message = message;
    this.metadata = metadata;
  }
}
