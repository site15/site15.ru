import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SsoOAuthTokenTenantIdProviderIdUserIdAccessTokenUniqueInputDto {
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
  providerId!: string;
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
  accessToken!: string;
}

@ApiExtraModels(SsoOAuthTokenTenantIdProviderIdUserIdAccessTokenUniqueInputDto)
export class ConnectSsoOAuthTokenDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: SsoOAuthTokenTenantIdProviderIdUserIdAccessTokenUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SsoOAuthTokenTenantIdProviderIdUserIdAccessTokenUniqueInputDto)
  tenantId_providerId_userId_accessToken?: SsoOAuthTokenTenantIdProviderIdUserIdAccessTokenUniqueInputDto;
}
