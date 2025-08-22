import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MetricsGithubTeamUserTenantIdTeamIdUserIdUniqueInputDto {
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
  userId!: string;
}

@ApiExtraModels(MetricsGithubTeamUserTenantIdTeamIdUserIdUniqueInputDto)
export class ConnectMetricsGithubTeamUserDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: MetricsGithubTeamUserTenantIdTeamIdUserIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MetricsGithubTeamUserTenantIdTeamIdUserIdUniqueInputDto)
  tenantId_teamId_userId?: MetricsGithubTeamUserTenantIdTeamIdUserIdUniqueInputDto;
}
