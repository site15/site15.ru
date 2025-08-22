import { IsNotEmpty, IsString } from 'class-validator';
import { CreateMetricsGithubUserStatisticsDto } from '../generated/rest/dto/create-metrics-github-user-statistics.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFullMetricsGithubUserStatisticsDto extends CreateMetricsGithubUserStatisticsDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  userId!: string;
}
