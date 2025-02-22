import { EnvModel, EnvModelProperty } from '@nestjs-mod/common';
import { IsNotEmpty, IsOptional } from 'class-validator';

import ms from 'ms';

@EnvModel()
export class SsoEnvironments {
  @EnvModelProperty({
    description: 'Domain name for use in templates',
  })
  @IsNotEmpty()
  templatesVarDomain!: string;

  @EnvModelProperty({
    description: 'Available user roles',
    default: 'user,admin',
    hidden: true,
  })
  @IsOptional()
  userAvailableRoles?: string;

  @EnvModelProperty({
    description: 'Default roles for new user',
    default: 'user',
    hidden: true,
  })
  @IsOptional()
  userDefaultRoles?: string;

  @EnvModelProperty({
    description: 'Secret key for generate jwt keys',
    default: 'AcJwUY9AP6FPf8XnfwbSuW7ZjwoaPiFJ',
    hidden: true,
  })
  @IsOptional()
  jwtSecretKey?: string;

  @EnvModelProperty({
    description: 'Access token expires in',
    default: '30m',
    hidden: true,
  })
  @IsNotEmpty()
  jwtAccessTokenExpiresIn!: ms.StringValue;

  @EnvModelProperty({
    description: 'Refresh token expires in',
    default: '24h',
    hidden: true,
  })
  @IsNotEmpty()
  jwtRefreshTokenExpiresIn!: ms.StringValue;
}
