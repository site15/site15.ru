import { ApiProperty } from '@nestjs/swagger';
import { MetricsUser } from './metrics-user.entity';
import { MetricsGithubTeam } from './metrics-github-team.entity';
import { MetricsGithubUser } from './metrics-github-user.entity';

export class MetricsGithubTeamUser {
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
  userId!: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  role!: string | null;
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
  MetricsUser_MetricsGithubTeamUser_createdByToMetricsUser?: MetricsUser;
  @ApiProperty({
    type: () => MetricsGithubTeam,
    required: false,
  })
  MetricsGithubTeam?: MetricsGithubTeam;
  @ApiProperty({
    type: () => MetricsUser,
    required: false,
  })
  MetricsUser_MetricsGithubTeamUser_updatedByToMetricsUser?: MetricsUser;
  @ApiProperty({
    type: () => MetricsGithubUser,
    required: false,
  })
  MetricsGithubUser?: MetricsGithubUser;
}
