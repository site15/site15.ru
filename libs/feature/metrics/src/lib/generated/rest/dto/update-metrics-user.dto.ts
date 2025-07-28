import { MetricsRole } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateMetricsUserDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  tenantId?: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  externalUserId?: string;
  @ApiProperty({
    enum: MetricsRole,
    enumName: 'MetricsRole',
    required: false,
  })
  @IsOptional()
  @IsEnum(MetricsRole)
  userRole?: MetricsRole;
}
