import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class SignOutArgs {
  @ApiPropertyOptional({ type: String })
  @IsUUID()
  @IsOptional()
  refreshToken?: string;
}
