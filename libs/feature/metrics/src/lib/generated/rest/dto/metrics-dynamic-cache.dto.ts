import { Prisma } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';

export class MetricsDynamicCacheDto {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  url!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  status!: string | null;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  headers!: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  body!: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt!: Date;
}
