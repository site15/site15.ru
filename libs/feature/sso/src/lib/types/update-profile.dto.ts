import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import { SsoUserDto } from '../generated/rest/dto/sso-user.dto';
import { EqualsTo } from '../utils/equals-to';

export class UpdateProfileArgs extends PickType(SsoUserDto, [
  'birthdate',
  'firstname',
  'lastname',
  'picture',
  'gender',
  'lang',
  'timezone',
]) {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  override birthdate!: Date | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  override firstname!: string | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  override lastname!: string | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  override picture!: string | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  override gender!: string | null;

  @ApiPropertyOptional({
    type: 'number',
    format: 'float',
    nullable: true,
  })
  @IsOptional()
  override timezone!: number | null;

  @ApiPropertyOptional({
    type: 'string',
    nullable: true,
  })
  @IsOptional()
  override lang!: string | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  oldPassword!: string | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  password!: string | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Validate(EqualsTo, ['password'])
  confirmPassword!: string | null;
}
