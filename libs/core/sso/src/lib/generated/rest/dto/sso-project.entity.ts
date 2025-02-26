import { ApiProperty } from '@nestjs/swagger';
import { SsoRefreshSession } from './sso-refresh-session.entity';
import { SsoTwoFactorCode } from './sso-two-factor-code.entity';
import { SsoUser } from './sso-user.entity';

export class SsoProject {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  clientId!: string;
  @ApiProperty({
    type: 'string',
  })
  clientSecret!: string;
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
    type: () => SsoRefreshSession,
    isArray: true,
    required: false,
  })
  SsoRefreshSession?: SsoRefreshSession[];
  @ApiProperty({
    type: () => SsoTwoFactorCode,
    required: false,
    nullable: true,
  })
  SsoTwoFactorCode?: SsoTwoFactorCode | null;
  @ApiProperty({
    type: () => SsoUser,
    isArray: true,
    required: false,
  })
  SsoUser?: SsoUser[];
}
