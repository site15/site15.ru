import { MetricsRole } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';

export class MetricsUserDto {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  tenantId!: string;
  @ApiProperty({
    type: 'string',
  })
  externalUserId!: string;
  @ApiProperty({
    enum: MetricsRole,
    enumName: 'MetricsRole',
  })
  userRole!: MetricsRole;
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
    type: 'boolean',
  })
  botForDataSync!: boolean;
}
