import { MetricsRole } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateMetricsUserDto {
  @ApiProperty({
    enum: MetricsRole,
    enumName: 'MetricsRole',
  })
  @IsNotEmpty()
  @IsEnum(MetricsRole)
  userRole!: MetricsRole;
}
