import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TokensResponse {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  accessToken!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  refreshToken!: string;
}
