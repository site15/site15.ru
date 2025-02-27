import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TwoFactorCodeUserIdExternalTenantIdUniqueInputDto {
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
  externalTenantId!: string;
}
export class TwoFactorCodeUserIdOperationNameTypeCodeExternalTenantIdUniqueInputDto {
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
  operationName!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  type!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  code!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  externalTenantId!: string;
}

@ApiExtraModels(
  TwoFactorCodeUserIdExternalTenantIdUniqueInputDto,
  TwoFactorCodeUserIdOperationNameTypeCodeExternalTenantIdUniqueInputDto
)
export class ConnectTwoFactorCodeDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  externalTenantId?: string;
  @ApiProperty({
    type: TwoFactorCodeUserIdExternalTenantIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TwoFactorCodeUserIdExternalTenantIdUniqueInputDto)
  userId_externalTenantId?: TwoFactorCodeUserIdExternalTenantIdUniqueInputDto;
  @ApiProperty({
    type: TwoFactorCodeUserIdOperationNameTypeCodeExternalTenantIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(
    () => TwoFactorCodeUserIdOperationNameTypeCodeExternalTenantIdUniqueInputDto
  )
  userId_operationName_type_code_externalTenantId?: TwoFactorCodeUserIdOperationNameTypeCodeExternalTenantIdUniqueInputDto;
}
