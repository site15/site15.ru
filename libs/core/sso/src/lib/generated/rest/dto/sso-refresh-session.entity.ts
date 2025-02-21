import { ApiProperty } from '@nestjs/swagger';
import { SsoUser } from './sso-user.entity';

export class SsoRefreshSession {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  refreshToken!: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  userAgent!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  fingerprint!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  userIp!: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int64',
    nullable: true,
  })
  expiresIn!: bigint | null;
  @ApiProperty({
    type: 'string',
  })
  userId!: string;
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
    type: () => SsoUser,
    required: false,
  })
  SsoUser?: SsoUser;
}
