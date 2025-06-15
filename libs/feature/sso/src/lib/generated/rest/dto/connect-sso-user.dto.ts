import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SsoUserEmailProjectIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  email!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  projectId!: string;
}
export class SsoUserUsernameProjectIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  username!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  projectId!: string;
}

@ApiExtraModels(SsoUserEmailProjectIdUniqueInputDto, SsoUserUsernameProjectIdUniqueInputDto)
export class ConnectSsoUserDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: SsoUserEmailProjectIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SsoUserEmailProjectIdUniqueInputDto)
  email_projectId?: SsoUserEmailProjectIdUniqueInputDto;
  @ApiProperty({
    type: SsoUserUsernameProjectIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SsoUserUsernameProjectIdUniqueInputDto)
  username_projectId?: SsoUserUsernameProjectIdUniqueInputDto;
}
