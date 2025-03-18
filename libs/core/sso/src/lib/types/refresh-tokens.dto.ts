import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class RefreshTokensResponse {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  fingerprint!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  refreshToken?: string;
}
