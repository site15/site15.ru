import { ApiProperty } from "@nestjs/swagger";
import { contact_types } from "@prisma/client";
import { IsAlpha, IsNumber } from "class-validator";

export class CreateContactTypeDto implements contact_types {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsAlpha()
  name: string;

  @ApiProperty()
  @IsAlpha()
  title: string;

  @ApiProperty()
  @IsAlpha()
  title_ru: string;
}
