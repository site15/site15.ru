import { IsNotEmpty } from 'class-validator';

export class TokensResponse {
  @IsNotEmpty()
  accessToken!: string;

  @IsNotEmpty()
  refreshToken!: string;
}
