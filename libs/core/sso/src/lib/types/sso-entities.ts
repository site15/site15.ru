import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/sso-client';

export class SsoEntities {
  @ApiProperty({
    enum: Prisma.SsoProjectScalarFieldEnum,
    enumName: 'SsoProjectScalarFieldEnum',
  })
  ssoProject!: Prisma.SsoProjectScalarFieldEnum;

  @ApiProperty({
    enum: Prisma.SsoUserScalarFieldEnum,
    enumName: 'SsoUserScalarFieldEnum',
  })
  ssoUser!: Prisma.SsoUserScalarFieldEnum;
}
