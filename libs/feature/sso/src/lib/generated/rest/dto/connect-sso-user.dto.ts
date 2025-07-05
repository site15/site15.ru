import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SsoUserTenantIdEmailUniqueInputDto {
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
  email!: string;
}
export class SsoUserTenantIdUsernameUniqueInputDto {
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
  username!: string;
}

@ApiExtraModels(SsoUserTenantIdEmailUniqueInputDto, SsoUserTenantIdUsernameUniqueInputDto)
export class ConnectSsoUserDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: SsoUserTenantIdEmailUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SsoUserTenantIdEmailUniqueInputDto)
  tenantId_email?: SsoUserTenantIdEmailUniqueInputDto;
  @ApiProperty({
    type: SsoUserTenantIdUsernameUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SsoUserTenantIdUsernameUniqueInputDto)
  tenantId_username?: SsoUserTenantIdUsernameUniqueInputDto;
}
