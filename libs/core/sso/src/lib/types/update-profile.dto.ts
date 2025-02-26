import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { SsoUserDto } from '../generated/rest/dto/sso-user.dto';

export class UpdateProfileArgs extends PickType(SsoUserDto, [
  'birthdate',
  'firstname',
  'lastname',
  'picture',
  'gender',
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
}
