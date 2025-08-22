import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MetricsGithubTeamRepositoryTenantIdTeamIdRepositoryIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  tenantId!: string;
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

@ApiExtraModels(MetricsGithubTeamRepositoryTenantIdTeamIdRepositoryIdUniqueInputDto)
export class ConnectMetricsGithubTeamRepositoryDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: MetricsGithubTeamRepositoryTenantIdTeamIdRepositoryIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MetricsGithubTeamRepositoryTenantIdTeamIdRepositoryIdUniqueInputDto)
  tenantId_teamId_repositoryId?: MetricsGithubTeamRepositoryTenantIdTeamIdRepositoryIdUniqueInputDto;
}
