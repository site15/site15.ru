import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { MetricsGithubUser } from '../generated/rest/dto/metrics-github-user.entity';

export class FindManyMetricsGithubUserResponse {
  @ApiProperty({ type: () => [MetricsGithubUser] })
  metricsGithubUsers!: MetricsGithubUser[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
