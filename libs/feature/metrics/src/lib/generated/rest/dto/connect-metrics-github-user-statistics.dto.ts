import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MetricsGithubUserStatisticsTenantIdUserIdPeriodTypeRecordedAtUniqueInputDto {
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
  periodType!: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  recordedAt!: Date;
}

@ApiExtraModels(MetricsGithubUserStatisticsTenantIdUserIdPeriodTypeRecordedAtUniqueInputDto)
export class ConnectMetricsGithubUserStatisticsDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: MetricsGithubUserStatisticsTenantIdUserIdPeriodTypeRecordedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MetricsGithubUserStatisticsTenantIdUserIdPeriodTypeRecordedAtUniqueInputDto)
  tenantId_userId_periodType_recordedAt?: MetricsGithubUserStatisticsTenantIdUserIdPeriodTypeRecordedAtUniqueInputDto;
}
