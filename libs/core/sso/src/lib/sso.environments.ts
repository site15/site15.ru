import { EnvModel, EnvModelProperty } from '@nestjs-mod/common';
import { IsNotEmpty, IsOptional } from 'class-validator';

import ms from 'ms';

@EnvModel()
export class SsoEnvironments {
  @EnvModelProperty({
    description: 'Domain name for use in emails',
  })
  @IsNotEmpty()
  ssoDomain!: string;

  @EnvModelProperty({
    description: 'Available roles',
    default: 'user,admin',
  })
  @IsOptional()
  ssoRoles?: string;

  @EnvModelProperty({
    description: 'Default roles for new user',
    default: 'user',
  })
  @IsOptional()
  ssoDefaultRoles?: string;

  @EnvModelProperty({
    description: 'Secret key',
    default: 'AcJwUY9AP6FPf8XnfwbSuW7ZjwoaPiFJ',
  })
  @IsOptional()
  ssoJwtSecretKey?: string;

  @EnvModelProperty({
    description: 'Access token expires in',
    default: '30m',
  })
  @IsNotEmpty()
  ssoJwtAccessTokenExpiresIn!: ms.StringValue;

  @EnvModelProperty({
    description: 'Refresh token expires in',
    default: '24h',
  })
  @IsNotEmpty()
  ssoJwtRefreshTokenExpiresIn!: ms.StringValue;
}
