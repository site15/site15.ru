import { ApiProperty } from '@nestjs/swagger';

export class MetricsDynamicHistoryDto {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  level1!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  level2!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  level3!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  value!: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt!: Date;
}
