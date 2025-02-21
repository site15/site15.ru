import { IsNotEmpty, IsOptional } from 'class-validator';

export class RefreshTokensResponse {
  @IsNotEmpty()
  fingerprint!: string;

  @IsOptional()
  refreshToken?: string;
}
