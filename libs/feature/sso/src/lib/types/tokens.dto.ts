import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { SsoUser } from '../generated/rest/dto/sso-user.entity';
import { SsoUserDto } from '../generated/rest/dto/sso-user.dto';

export class TokensResponse {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  accessToken!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  refreshToken!: string;

  @ApiProperty({ type: () => SsoUser })
  user!: SsoUserDto;
}
