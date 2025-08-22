import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MetricsGithubTeamTenantIdNameUniqueInputDto {
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
}

@ApiExtraModels(MetricsGithubTeamTenantIdNameUniqueInputDto)
export class ConnectMetricsGithubTeamDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: MetricsGithubTeamTenantIdNameUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MetricsGithubTeamTenantIdNameUniqueInputDto)
  tenantId_name?: MetricsGithubTeamTenantIdNameUniqueInputDto;
}
