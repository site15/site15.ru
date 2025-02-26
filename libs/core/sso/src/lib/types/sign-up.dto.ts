import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Validate } from 'class-validator';
import { EqualsTo } from '../utils/equals-to';

export class SignUpArgs {
  @ApiProperty({ type: String })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ type: String })
  @IsNotEmpty()
  @Validate(EqualsTo, ['password'])
  rePassword?: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  fingerprint!: string;
}

export class CompleteSignUpArgs {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  fingerprint!: string;
}
