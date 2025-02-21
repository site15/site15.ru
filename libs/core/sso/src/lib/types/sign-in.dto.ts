import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInArgs {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  password!: string;

  @IsNotEmpty()
  fingerprint!: string;
}
