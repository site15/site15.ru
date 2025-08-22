import { IsNotEmpty, IsString } from 'class-validator';
import { CreateMetricsGithubMetricDto } from '../generated/rest/dto/create-metrics-github-metric.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFullMetricsGithubMetricDto extends CreateMetricsGithubMetricDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  repositoryId!: string;
}
