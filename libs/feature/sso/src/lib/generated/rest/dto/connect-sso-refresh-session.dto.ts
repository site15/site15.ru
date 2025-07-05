import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SsoRefreshSessionTenantIdUserIdFingerprintUniqueInputDto {
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
  userId!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  fingerprint!: string;
}

@ApiExtraModels(SsoRefreshSessionTenantIdUserIdFingerprintUniqueInputDto)
export class ConnectSsoRefreshSessionDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: SsoRefreshSessionTenantIdUserIdFingerprintUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SsoRefreshSessionTenantIdUserIdFingerprintUniqueInputDto)
  tenantId_userId_fingerprint?: SsoRefreshSessionTenantIdUserIdFingerprintUniqueInputDto;
}
