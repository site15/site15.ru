import { ApiPropertyOptional } from "@nestjs/swagger";
import { contact_types } from "@prisma/client";
import { IsAlpha, IsNumber, IsOptional } from "class-validator";

export class UpdateContactTypeDto implements Partial<contact_types> {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsAlpha()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsAlpha()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsAlpha()
  title_ru?: string;
}
