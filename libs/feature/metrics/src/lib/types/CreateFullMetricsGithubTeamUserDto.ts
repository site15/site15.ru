import { IsNotEmpty, IsString } from 'class-validator';
import { CreateMetricsGithubTeamUserDto } from '../generated/rest/dto/create-metrics-github-team-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFullMetricsGithubTeamUserDto extends CreateMetricsGithubTeamUserDto {
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
  userId!: string;
}
