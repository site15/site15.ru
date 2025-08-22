import { ApiProperty } from '@nestjs/swagger';
import { MetricsUser } from './metrics-user.entity';
import { MetricsGithubTeamRepository } from './metrics-github-team-repository.entity';
import { MetricsGithubTeamUser } from './metrics-github-team-user.entity';

export class MetricsGithubTeam {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  name!: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description!: string | null;
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
  MetricsUser_MetricsGithubTeam_createdByToMetricsUser?: MetricsUser;
  @ApiProperty({
    type: () => MetricsUser,
    required: false,
  })
  MetricsUser_MetricsGithubTeam_updatedByToMetricsUser?: MetricsUser;
  @ApiProperty({
    type: () => MetricsGithubTeamRepository,
    isArray: true,
    required: false,
  })
  MetricsGithubTeamRepository?: MetricsGithubTeamRepository[];
  @ApiProperty({
    type: () => MetricsGithubTeamUser,
    isArray: true,
    required: false,
  })
  MetricsGithubTeamUser?: MetricsGithubTeamUser[];
}
