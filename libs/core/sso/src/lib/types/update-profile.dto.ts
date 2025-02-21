import { OmitType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { SsoUserDto } from '../generated/rest/dto/sso-user.dto';

export class UpdateProfileModel extends OmitType(SsoUserDto, [
  'createdAt',
  'updatedAt',
  'roles',
  'appData',
  'id',
]) {
  @IsOptional()
  override birthdate!: Date | null;

  @IsOptional()
  override email!: string;

  @IsOptional()
  override firstname!: string | null;

  @IsOptional()
  override lastname!: string | null;

  @IsOptional()
  override password!: string;

  @IsOptional()
  override picture!: string | null;

  @IsOptional()
  override username!: string | null;
}
