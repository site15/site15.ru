import { IsNotEmpty, IsString } from 'class-validator';
import { CreateMetricsGithubUserRepositoryDto } from '../generated/rest/dto/create-metrics-github-user-repository.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFullMetricsGithubUserRepositoryDto extends CreateMetricsGithubUserRepositoryDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  repositoryId!: string;
}
