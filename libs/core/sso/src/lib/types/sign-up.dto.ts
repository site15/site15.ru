import { IsEmail, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { EqualsTo } from '../utils/equals-to';

export class SignUpArgs {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  username?: string;

  @IsNotEmpty()
  password!: string;

  @IsNotEmpty()
  @Validate(EqualsTo, ['password'])
  rePassword?: string;

  @IsNotEmpty()
  fingerprint!: string;
}
