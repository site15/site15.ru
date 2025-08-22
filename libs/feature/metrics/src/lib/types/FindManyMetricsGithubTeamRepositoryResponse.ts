import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { MetricsGithubTeamRepositoryDto } from '../generated/rest/dto/metrics-github-team-repository.dto';

export class FindManyMetricsGithubTeamRepositoryResponse {
  @ApiProperty({
    type: MetricsGithubTeamRepositoryDto,
    isArray: true,
  })
  metricsGithubTeamRepositories!: MetricsGithubTeamRepositoryDto[];

  @ApiProperty({
    type: FindManyResponseMeta,
  })
  meta!: FindManyResponseMeta;
}
