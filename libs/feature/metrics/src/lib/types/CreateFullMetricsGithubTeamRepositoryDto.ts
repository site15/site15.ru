import { IsNotEmpty, IsString } from 'class-validator';
import { CreateMetricsGithubTeamRepositoryDto } from '../generated/rest/dto/create-metrics-github-team-repository.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFullMetricsGithubTeamRepositoryDto extends CreateMetricsGithubTeamRepositoryDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  teamId!: string;

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  repositoryId!: string;
}
