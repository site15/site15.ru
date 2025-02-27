import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class RefreshTokensResponse {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  fingerprint!: string;

  @ApiPropertyOptional({ type: String })
  @IsUUID()
  @IsOptional()
  refreshToken?: string;
}
