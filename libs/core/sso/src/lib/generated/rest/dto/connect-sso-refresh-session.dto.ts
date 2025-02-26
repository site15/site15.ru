import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SsoRefreshSessionUserIdFingerprintProjectIdUniqueInputDto {
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
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  projectId!: string;
}

@ApiExtraModels(SsoRefreshSessionUserIdFingerprintProjectIdUniqueInputDto)
export class ConnectSsoRefreshSessionDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: SsoRefreshSessionUserIdFingerprintProjectIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SsoRefreshSessionUserIdFingerprintProjectIdUniqueInputDto)
  userId_fingerprint_projectId?: SsoRefreshSessionUserIdFingerprintProjectIdUniqueInputDto;
}
