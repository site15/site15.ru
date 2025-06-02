import {
  ArrayOfStringTransformer,
  BooleanTransformer,
  EnvModel,
  EnvModelProperty,
} from '@nestjs-mod/common';
import { IsNotEmpty, IsOptional } from 'class-validator';

import ms from 'ms';
import { SsoRole } from './types/sso-role';
import {
  SsoProjectType,
  StringToProjectsTransformer,
  StringToProjectTransformer,
} from './utils/string-to-project.transformer';

@EnvModel()
export class SsoStaticEnvironments {
  // middlewares
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
    description: 'Use interceptors',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useInterceptors?: boolean;

  @EnvModelProperty({
    description: 'Use pipes',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  usePipes?: boolean;

  // variables for emails and redirects

  @EnvModelProperty({
    description: 'Server URL',
  })
  @IsNotEmpty()
  serverUrl!: string;

  @EnvModelProperty({
    description: 'Client URL',
  })
  @IsNotEmpty()
  clientUrl!: string;

  // default admin settings

  @EnvModelProperty({
    description: 'Admin secret key',
  })
  adminSecret?: string;

  @EnvModelProperty({
    description: 'Global admin username',
    default: 'admin@example.com',
  })
  adminEmail?: string;

  @EnvModelProperty({
    description: 'Global admin username',
    default: 'admin',
  })
  @IsNotEmpty()
  adminUsername?: string;

  @EnvModelProperty({
    description: 'Global admin password',
  })
  adminPassword?: string;

  // roles

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
    description: 'Default roles for manager',
    default: [SsoRole.manager],
    transform: new ArrayOfStringTransformer(),
    hidden: true,
  })
  @IsOptional()
  managerDefaultRoles?: string[];

  // JWT
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
  @IsOptional()
  jwtAccessTokenExpiresIn!: ms.StringValue;

  @EnvModelProperty({
    description: 'Refresh token expires in',
    default: '24h',
    hidden: true,
  })
  @IsOptional()
  jwtRefreshTokenExpiresIn!: ms.StringValue;

  // cache settings
  @EnvModelProperty({
    description: 'TTL for cached data',
    default: 15_000,
    hidden: true,
  })
  cacheTTL?: number;

  // projects
  @EnvModelProperty({
    description:
      'Default public projects (example: "name1:ru=название1:tt=исем1,clientId1,clientSecret1;name2:ru=название2:tt=исем2,clientId2,clientSecret2")',
    transform: new StringToProjectsTransformer(),
  })
  defaultPublicProjects?: SsoProjectType[];

  @EnvModelProperty({
    description:
      'Default projects (example: "name3:ru=название3,clientId3,clientSecret3;name4:ru=название4,clientId4,clientSecret4")',
    transform: new StringToProjectTransformer(),
  })
  defaultProject?: SsoProjectType;

  // verification settings
  @EnvModelProperty({
    description: 'Used to disable the email verification while signing up',
    transform: new BooleanTransformer(),
    default: false,
    hidden: true,
  })
  disableEmailVerification?: boolean;

  // oauth settings
  @EnvModelProperty({
    description:
      'Client ID for Google application (https://console.cloud.google.com/apis/credentials)',
  })
  googleOauthClientId?: string;

  @EnvModelProperty({
    description:
      'Client secret key for Google application (https://console.cloud.google.com/apis/credentials)',
  })
  googleOauthClientSecretKey?: string;
}
