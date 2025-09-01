import { MetricsRole } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class UpdateMetricsUserDto {
  @ApiProperty({
    enum: MetricsRole,
    enumName: 'MetricsRole',
    required: false,
  })
  @IsOptional()
  @IsEnum(MetricsRole)
  userRole?: MetricsRole;
  @ApiProperty({
    type: 'boolean',
    default: false,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  botForDataSync?: boolean | null;
}
