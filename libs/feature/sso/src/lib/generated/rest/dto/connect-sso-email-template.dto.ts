import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SsoEmailTemplateProjectIdOperationNameUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  projectId!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  operationName!: string;
}

@ApiExtraModels(SsoEmailTemplateProjectIdOperationNameUniqueInputDto)
export class ConnectSsoEmailTemplateDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: SsoEmailTemplateProjectIdOperationNameUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SsoEmailTemplateProjectIdOperationNameUniqueInputDto)
  projectId_operationName?: SsoEmailTemplateProjectIdOperationNameUniqueInputDto;
}
