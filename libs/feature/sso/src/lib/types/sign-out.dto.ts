import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SignOutArgs {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  refreshToken?: string;
}
