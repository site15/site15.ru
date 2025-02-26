import {
  BooleanTransformer,
  EnvModel,
  EnvModelProperty,
} from '@nestjs-mod/common';
import { IsNotEmpty, IsOptional } from 'class-validator';

import ms from 'ms';

@EnvModel()
export class SsoStaticEnvironments {
  @EnvModelProperty({
    description: 'Use guards',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useGuards?: boolean;

  @EnvModelProperty({
    description: 'Use filters',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useFilters?: boolean;

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

  @EnvModelProperty({
    description: 'Admin secret key',
  })
  adminSecret?: string;
}
