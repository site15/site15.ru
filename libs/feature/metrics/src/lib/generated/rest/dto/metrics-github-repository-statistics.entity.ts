import { ApiProperty } from '@nestjs/swagger';
import { MetricsUser } from './metrics-user.entity';
import { MetricsGithubRepository } from './metrics-github-repository.entity';

export class MetricsGithubRepositoryStatistics {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  repositoryId!: string;
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
  MetricsUser_MetricsGithubRepositoryStatistics_createdByToMetricsUser?: MetricsUser;
  @ApiProperty({
    type: () => MetricsGithubRepository,
    required: false,
  })
  MetricsGithubRepository?: MetricsGithubRepository;
  @ApiProperty({
    type: () => MetricsUser,
    required: false,
  })
  MetricsUser_MetricsGithubRepositoryStatistics_updatedByToMetricsUser?: MetricsUser;
}
