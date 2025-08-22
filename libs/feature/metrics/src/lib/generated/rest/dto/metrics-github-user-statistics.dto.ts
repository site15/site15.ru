import { ApiProperty } from '@nestjs/swagger';

export class MetricsGithubUserStatisticsDto {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  periodType!: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  followersCount!: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  followingCount!: number | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  recordedAt!: Date;
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
    type: 'string',
  })
  tenantId!: string;
}
