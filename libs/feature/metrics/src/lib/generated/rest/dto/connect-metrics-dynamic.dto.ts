import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MetricsDynamicLevel1Level2Level3UniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  level1!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  level2!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  level3!: string;
}

@ApiExtraModels(MetricsDynamicLevel1Level2Level3UniqueInputDto)
export class ConnectMetricsDynamicDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: MetricsDynamicLevel1Level2Level3UniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MetricsDynamicLevel1Level2Level3UniqueInputDto)
  level1_level2_level3?: MetricsDynamicLevel1Level2Level3UniqueInputDto;
}
