import { ApiProperty } from '@nestjs/swagger';
import { MetricsUser } from './metrics-user.entity';
import { MetricsGithubUser } from './metrics-github-user.entity';

export class MetricsGithubUserStatistics {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  userId!: string;
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
  })
  createdBy!: string;
  @ApiProperty({
    type: 'string',
  })
  updatedBy!: string;
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
  @ApiProperty({
    type: () => MetricsUser,
    required: false,
  })
  MetricsUser_MetricsGithubUserStatistics_createdByToMetricsUser?: MetricsUser;
  @ApiProperty({
    type: () => MetricsUser,
    required: false,
  })
  MetricsUser_MetricsGithubUserStatistics_updatedByToMetricsUser?: MetricsUser;
  @ApiProperty({
    type: () => MetricsGithubUser,
    required: false,
  })
  MetricsGithubUser?: MetricsGithubUser;
}
