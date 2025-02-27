import { Prisma } from '../../../../../../../../node_modules/@prisma/sso-client';
import { ApiProperty } from '@nestjs/swagger';

export class SsoRefreshSessionDto {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  userAgent!: string | null;
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
    type: () => Object,
    nullable: true,
  })
  userData!: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'boolean',
  })
  enabled!: boolean;
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
