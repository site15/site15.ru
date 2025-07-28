import { MetricsRole } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateMetricsUserDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  tenantId!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  externalUserId!: string;
  @ApiProperty({
    enum: MetricsRole,
    enumName: 'MetricsRole',
  })
  @IsNotEmpty()
  @IsEnum(MetricsRole)
  userRole!: MetricsRole;
}
