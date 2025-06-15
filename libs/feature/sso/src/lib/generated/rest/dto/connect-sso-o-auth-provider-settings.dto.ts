import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SsoOAuthProviderSettingsProviderIdNameUniqueInputDto {
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
  name!: string;
}

@ApiExtraModels(SsoOAuthProviderSettingsProviderIdNameUniqueInputDto)
export class ConnectSsoOAuthProviderSettingsDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: SsoOAuthProviderSettingsProviderIdNameUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SsoOAuthProviderSettingsProviderIdNameUniqueInputDto)
  providerId_name?: SsoOAuthProviderSettingsProviderIdNameUniqueInputDto;
}
