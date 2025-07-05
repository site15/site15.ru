import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SsoEmailTemplateTenantIdOperationNameUniqueInputDto {
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
  operationName!: string;
}

@ApiExtraModels(SsoEmailTemplateTenantIdOperationNameUniqueInputDto)
export class ConnectSsoEmailTemplateDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: SsoEmailTemplateTenantIdOperationNameUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SsoEmailTemplateTenantIdOperationNameUniqueInputDto)
  tenantId_operationName?: SsoEmailTemplateTenantIdOperationNameUniqueInputDto;
}
