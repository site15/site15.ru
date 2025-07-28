import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';

export class FindManyMetricsArgs {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  curPage?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  perPage?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  searchText?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
