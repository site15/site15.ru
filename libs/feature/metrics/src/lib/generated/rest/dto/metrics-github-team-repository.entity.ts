import { ApiProperty } from '@nestjs/swagger';
import { MetricsUser } from './metrics-user.entity';
import { MetricsGithubRepository } from './metrics-github-repository.entity';
import { MetricsGithubTeam } from './metrics-github-team.entity';

export class MetricsGithubTeamRepository {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  teamId!: string;
  @ApiProperty({
    type: 'string',
  })
  repositoryId!: string;
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
  MetricsUser_MetricsGithubTeamRepository_createdByToMetricsUser?: MetricsUser;
  @ApiProperty({
    type: () => MetricsGithubRepository,
    required: false,
  })
  MetricsGithubRepository?: MetricsGithubRepository;
  @ApiProperty({
    type: () => MetricsGithubTeam,
    required: false,
  })
  MetricsGithubTeam?: MetricsGithubTeam;
  @ApiProperty({
    type: () => MetricsUser,
    required: false,
  })
  MetricsUser_MetricsGithubTeamRepository_updatedByToMetricsUser?: MetricsUser;
}
