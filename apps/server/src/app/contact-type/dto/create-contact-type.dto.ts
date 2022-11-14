import { ApiProperty } from "@nestjs/swagger";
import { contact_types } from "@prisma/client";

export class CreateContactTypeDto implements Omit<contact_types, "id"> {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  title_ru!: string;
}
