import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MetricsGithubUserRepositoryTenantIdUserIdRepositoryIdUniqueInputDto {
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
  userId!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  repositoryId!: string;
}

@ApiExtraModels(MetricsGithubUserRepositoryTenantIdUserIdRepositoryIdUniqueInputDto)
export class ConnectMetricsGithubUserRepositoryDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: MetricsGithubUserRepositoryTenantIdUserIdRepositoryIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MetricsGithubUserRepositoryTenantIdUserIdRepositoryIdUniqueInputDto)
  tenantId_userId_repositoryId?: MetricsGithubUserRepositoryTenantIdUserIdRepositoryIdUniqueInputDto;
}
