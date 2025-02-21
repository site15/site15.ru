import { IsOptional } from 'class-validator';

export class SignOutArgs {
  @IsOptional()
  refreshToken?: string;
}
