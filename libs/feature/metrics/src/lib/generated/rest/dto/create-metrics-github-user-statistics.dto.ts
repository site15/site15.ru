import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMetricsGithubUserStatisticsDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  periodType!: string;
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
  })
  @IsNotEmpty()
  @IsDateString()
  recordedAt!: Date;
}
