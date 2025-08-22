import { MetricsRole } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateMetricsUserDto {
  @ApiProperty({
    enum: MetricsRole,
    enumName: 'MetricsRole',
    required: false,
  })
  @IsOptional()
  @IsEnum(MetricsRole)
  userRole?: MetricsRole;
}
