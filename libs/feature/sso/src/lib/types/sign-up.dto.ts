import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { EqualsTo } from '../utils/equals-to';

export class SignUpArgs {
  @ApiProperty({ type: String })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  username?: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ type: String })
  @IsNotEmpty()
  @Validate(EqualsTo, ['password'])
  confirmPassword?: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  fingerprint!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  redirectUri?: string;
}

export class CompleteSignUpArgs {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  fingerprint!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  code!: string;
}
