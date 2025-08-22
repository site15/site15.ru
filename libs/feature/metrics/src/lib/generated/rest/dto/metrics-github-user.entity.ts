import { ApiProperty } from '@nestjs/swagger';
import { MetricsGithubTeamUser } from './metrics-github-team-user.entity';
import { MetricsUser } from './metrics-user.entity';
import { MetricsGithubUserRepository } from './metrics-github-user-repository.entity';
import { MetricsGithubUserStatistics } from './metrics-github-user-statistics.entity';

export class MetricsGithubUser {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  login!: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  name!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  email!: string | null;
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
    type: 'string',
    nullable: true,
  })
  description!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  avatarUrl!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  websiteUrl!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  location!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  telegramUrl!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  twitterUrl!: string | null;
  @ApiProperty({
    type: () => MetricsGithubTeamUser,
    isArray: true,
    required: false,
  })
  MetricsGithubTeamUser?: MetricsGithubTeamUser[];
  @ApiProperty({
    type: () => MetricsUser,
    required: false,
  })
  MetricsUser_MetricsGithubUser_createdByToMetricsUser?: MetricsUser;
  @ApiProperty({
    type: () => MetricsUser,
    required: false,
  })
  MetricsUser_MetricsGithubUser_updatedByToMetricsUser?: MetricsUser;
  @ApiProperty({
    type: () => MetricsGithubUserRepository,
    isArray: true,
    required: false,
  })
  MetricsGithubUserRepository?: MetricsGithubUserRepository[];
  @ApiProperty({
    type: () => MetricsGithubUserStatistics,
    isArray: true,
    required: false,
  })
  MetricsGithubUserStatistics?: MetricsGithubUserStatistics[];
}
