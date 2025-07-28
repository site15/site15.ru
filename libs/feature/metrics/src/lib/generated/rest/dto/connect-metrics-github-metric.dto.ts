import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MetricsGithubMetricTenantIdRepositoryIdMetricNameRecordedAtUniqueInputDto {
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
  repositoryId!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  metricName!: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  recordedAt!: Date;
}

@ApiExtraModels(MetricsGithubMetricTenantIdRepositoryIdMetricNameRecordedAtUniqueInputDto)
export class ConnectMetricsGithubMetricDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: MetricsGithubMetricTenantIdRepositoryIdMetricNameRecordedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MetricsGithubMetricTenantIdRepositoryIdMetricNameRecordedAtUniqueInputDto)
  tenantId_repositoryId_metricName_recordedAt?: MetricsGithubMetricTenantIdRepositoryIdMetricNameRecordedAtUniqueInputDto;
}
