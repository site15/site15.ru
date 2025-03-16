import {
  ArrayOfStringTransformer,
  BooleanTransformer,
  EnvModel,
  EnvModelProperty,
} from '@nestjs-mod/common';
import { IsNotEmpty, IsOptional } from 'class-validator';

import ms from 'ms';
import { SsoRole } from './types/sso-role';

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
  templatesVarSsoServerUrl!: string;

  @EnvModelProperty({
    description: 'Available user roles',
    default: Object.keys(SsoRole),
    transform: new ArrayOfStringTransformer(),
    hidden: true,
  })
  @IsOptional()
  userAvailableRoles?: string[];

  @EnvModelProperty({
    description: 'Default roles for new user',
    default: [SsoRole.user],
    transform: new ArrayOfStringTransformer(),
    hidden: true,
  })
  @IsOptional()
  userDefaultRoles?: string[];

  @EnvModelProperty({
    description: 'Default roles for admin',
    default: [SsoRole.admin],
    transform: new ArrayOfStringTransformer(),
    hidden: true,
  })
  @IsOptional()
  adminDefaultRoles?: string[];

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

  @EnvModelProperty({
    description: 'Default client name',
  })
  defaultClientName?: string;

  @EnvModelProperty({
    description: 'Default client ID',
  })
  defaultClientId?: string;

  @EnvModelProperty({
    description: 'Default secret key',
  })
  defaultClientSecret?: string;
}
