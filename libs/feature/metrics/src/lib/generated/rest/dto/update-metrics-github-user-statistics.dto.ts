import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateMetricsGithubUserStatisticsDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  periodType?: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 0,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  followersCount?: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 0,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  followingCount?: number | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  recordedAt?: Date;
}
