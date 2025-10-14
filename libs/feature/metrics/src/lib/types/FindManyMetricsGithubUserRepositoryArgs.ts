import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumberString, IsOptional, IsUUID } from 'class-validator';
import { FindManyMetricsArgs } from './FindManyMetricsArgs';

export class FindManyMetricsGithubUserRepositoryArgs extends FindManyMetricsArgs {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  repositoryId?: string;
}
