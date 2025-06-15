import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SsoOAuthTokenProviderIdProjectIdUserIdAccessTokenUniqueInputDto {
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
  projectId!: string;
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

@ApiExtraModels(SsoOAuthTokenProviderIdProjectIdUserIdAccessTokenUniqueInputDto)
export class ConnectSsoOAuthTokenDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: SsoOAuthTokenProviderIdProjectIdUserIdAccessTokenUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SsoOAuthTokenProviderIdProjectIdUserIdAccessTokenUniqueInputDto)
  providerId_projectId_userId_accessToken?: SsoOAuthTokenProviderIdProjectIdUserIdAccessTokenUniqueInputDto;
}
