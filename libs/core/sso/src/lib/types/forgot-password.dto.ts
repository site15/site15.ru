import { IsEmail, IsNotEmpty, Validate } from 'class-validator';
import { EqualsTo } from '../utils/equals-to';

export class ForgotPasswordArgs {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class CompleteForgotPasswordArgs {
  @IsNotEmpty()
  password!: string;

  @IsNotEmpty()
  @Validate(EqualsTo, ['password'])
  rePassword!: string;

  @IsNotEmpty()
  fingerprint!: string;
}
