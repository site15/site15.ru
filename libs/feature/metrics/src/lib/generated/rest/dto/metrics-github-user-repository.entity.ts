import { ApiProperty } from '@nestjs/swagger';
import { MetricsUser } from './metrics-user.entity';
import { MetricsGithubRepository } from './metrics-github-repository.entity';
import { MetricsGithubUser } from './metrics-github-user.entity';

export class MetricsGithubUserRepository {
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
  repositoryId!: string;
  @ApiProperty({
    type: 'string',
  })
  role!: string;
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
  MetricsUser_MetricsGithubUserRepository_createdByToMetricsUser?: MetricsUser;
  @ApiProperty({
    type: () => MetricsGithubRepository,
    required: false,
  })
  MetricsGithubRepository?: MetricsGithubRepository;
  @ApiProperty({
    type: () => MetricsUser,
    required: false,
  })
  MetricsUser_MetricsGithubUserRepository_updatedByToMetricsUser?: MetricsUser;
  @ApiProperty({
    type: () => MetricsGithubUser,
    required: false,
  })
  MetricsGithubUser?: MetricsGithubUser;
}
