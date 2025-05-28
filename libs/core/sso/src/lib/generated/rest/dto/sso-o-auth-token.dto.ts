import { Prisma } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';

export class SsoOAuthTokenDto {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  grantedAt!: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  expiresAt!: Date | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  tokenType!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  scope!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  verificationCode!: string | null;
  @ApiProperty({
    type: 'string',
  })
  providerUserId!: string;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  providerUserData!: Prisma.JsonValue | null;
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
}
