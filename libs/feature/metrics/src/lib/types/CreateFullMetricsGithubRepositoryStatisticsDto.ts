import { IsNotEmpty, IsString } from 'class-validator';
import { CreateMetricsGithubRepositoryStatisticsDto } from '../generated/rest/dto/create-metrics-github-repository-statistics.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFullMetricsGithubRepositoryStatisticsDto extends CreateMetricsGithubRepositoryStatisticsDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  repositoryId!: string;
}
