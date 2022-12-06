import { ApiProperty } from "@nestjs/swagger";
import { contact_types } from "@prisma/client";
import { IsNotEmpty } from "class-validator";
export class ContactTypeDto implements Omit<contact_types, "id"> {
  @ApiProperty()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsNotEmpty()
  title!: string;

  @ApiProperty()
  @IsNotEmpty()
  title_ru!: string;
}
