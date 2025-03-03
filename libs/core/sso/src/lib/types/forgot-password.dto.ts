import { IsEmail, IsNotEmpty, Validate } from 'class-validator';
import { EqualsTo } from '../utils/equals-to';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordArgs {
  @ApiProperty({ type: String })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class CompleteForgotPasswordArgs {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @Validate(EqualsTo, ['password'])
  confirmPassword!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  fingerprint!: string;
}
