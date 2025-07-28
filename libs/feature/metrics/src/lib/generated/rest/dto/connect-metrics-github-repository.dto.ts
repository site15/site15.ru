import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MetricsGithubRepositoryTenantIdNameOwnerUniqueInputDto {
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
  name!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  owner!: string;
}

@ApiExtraModels(MetricsGithubRepositoryTenantIdNameOwnerUniqueInputDto)
export class ConnectMetricsGithubRepositoryDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: MetricsGithubRepositoryTenantIdNameOwnerUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MetricsGithubRepositoryTenantIdNameOwnerUniqueInputDto)
  tenantId_name_owner?: MetricsGithubRepositoryTenantIdNameOwnerUniqueInputDto;
}
