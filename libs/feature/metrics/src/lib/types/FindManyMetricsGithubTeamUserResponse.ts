import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { MetricsGithubTeamUserDto } from '../generated/rest/dto/metrics-github-team-user.dto';

export class FindManyMetricsGithubTeamUserResponse {
  @ApiProperty({
    type: MetricsGithubTeamUserDto,
    isArray: true,
  })
  metricsGithubTeamUsers!: MetricsGithubTeamUserDto[];

  @ApiProperty({
    type: FindManyResponseMeta,
  })
  meta!: FindManyResponseMeta;
}
