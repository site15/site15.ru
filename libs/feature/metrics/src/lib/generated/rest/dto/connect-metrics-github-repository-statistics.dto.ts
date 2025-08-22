import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MetricsGithubRepositoryStatisticsTenantIdRepositoryIdPeriodTypeRecordedAtUniqueInputDto {
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
  periodType!: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  recordedAt!: Date;
}

@ApiExtraModels(MetricsGithubRepositoryStatisticsTenantIdRepositoryIdPeriodTypeRecordedAtUniqueInputDto)
export class ConnectMetricsGithubRepositoryStatisticsDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: MetricsGithubRepositoryStatisticsTenantIdRepositoryIdPeriodTypeRecordedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MetricsGithubRepositoryStatisticsTenantIdRepositoryIdPeriodTypeRecordedAtUniqueInputDto)
  tenantId_repositoryId_periodType_recordedAt?: MetricsGithubRepositoryStatisticsTenantIdRepositoryIdPeriodTypeRecordedAtUniqueInputDto;
}
