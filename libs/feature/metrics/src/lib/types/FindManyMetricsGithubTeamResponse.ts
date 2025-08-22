import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { MetricsGithubTeamDto } from '../generated/rest/dto/metrics-github-team.dto';

export class FindManyMetricsGithubTeamResponse {
  @ApiProperty({
    type: MetricsGithubTeamDto,
    isArray: true,
  })
  metricsGithubTeams!: MetricsGithubTeamDto[];

  @ApiProperty({
    type: FindManyResponseMeta,
  })
  meta!: FindManyResponseMeta;
}
