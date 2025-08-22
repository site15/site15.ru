import { ApiProperty } from '@nestjs/swagger';

export class MetricsGithubRepositoryStatisticsDto {
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
  starsCount!: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  forksCount!: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  contributorsCount!: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  commitsCount!: number | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  lastCommitDate!: Date | null;
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
