import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SsoTwoFactorCodeUserIdOperationNameCodeProjectIdUniqueInputDto {
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
  code!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  projectId!: string;
}
export class SsoTwoFactorCodeUserIdProjectIdUniqueInputDto {
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
  projectId!: string;
}

@ApiExtraModels(
  SsoTwoFactorCodeUserIdOperationNameCodeProjectIdUniqueInputDto,
  SsoTwoFactorCodeUserIdProjectIdUniqueInputDto
)
export class ConnectSsoTwoFactorCodeDto {
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
  projectId?: string;
  @ApiProperty({
    type: SsoTwoFactorCodeUserIdOperationNameCodeProjectIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SsoTwoFactorCodeUserIdOperationNameCodeProjectIdUniqueInputDto)
  userId_operationName_code_projectId?: SsoTwoFactorCodeUserIdOperationNameCodeProjectIdUniqueInputDto;
  @ApiProperty({
    type: SsoTwoFactorCodeUserIdProjectIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SsoTwoFactorCodeUserIdProjectIdUniqueInputDto)
  userId_projectId?: SsoTwoFactorCodeUserIdProjectIdUniqueInputDto;
}
