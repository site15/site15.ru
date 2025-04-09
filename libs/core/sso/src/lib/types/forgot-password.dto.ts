import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { EqualsTo } from '../utils/equals-to';

export class ForgotPasswordArgs {
  @ApiProperty({ type: String })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  redirectUri?: string;
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

  @ApiProperty({ type: String })
  @IsNotEmpty()
  code!: string;
}
