import { ApiProperty } from '@nestjs/swagger';
import { MetricsUser } from './metrics-user.entity';
import { MetricsGithubUserRepository } from './metrics-github-user-repository.entity';

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
}
