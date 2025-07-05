import { Prisma } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';
import { SsoEmailTemplate } from './sso-email-template.entity';
import { SsoOAuthToken } from './sso-o-auth-token.entity';
import { SsoRefreshSession } from './sso-refresh-session.entity';
import { SsoUser } from './sso-user.entity';

export class SsoTenant {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  slug!: string;
  @ApiProperty({
    type: 'string',
  })
  name!: string;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  nameLocale!: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'string',
  })
  clientId!: string;
  @ApiProperty({
    type: 'string',
  })
  clientSecret!: string;
  @ApiProperty({
    type: 'boolean',
  })
  enabled!: boolean;
  @ApiProperty({
    type: 'boolean',
  })
  public!: boolean;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt!: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt!: Date;
  @ApiProperty({
    type: () => SsoEmailTemplate,
    isArray: true,
    required: false,
  })
  SsoEmailTemplate?: SsoEmailTemplate[];
  @ApiProperty({
    type: () => SsoOAuthToken,
    isArray: true,
    required: false,
  })
  SsoOAuthToken?: SsoOAuthToken[];
  @ApiProperty({
    type: () => SsoRefreshSession,
    isArray: true,
    required: false,
  })
  SsoRefreshSession?: SsoRefreshSession[];
  @ApiProperty({
    type: () => SsoUser,
    isArray: true,
    required: false,
  })
  SsoUser?: SsoUser[];
}
