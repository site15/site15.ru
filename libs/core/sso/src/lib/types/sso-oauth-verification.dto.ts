import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SsoOAuthVerificationArgs {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  verificationCode!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  fingerprint!: string;
}
