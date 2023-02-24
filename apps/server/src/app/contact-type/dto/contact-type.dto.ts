import { ApiProperty } from "@nestjs/swagger";
import { ContactTypes } from "@prisma/client";
import { IsNotEmpty } from "class-validator";
export class ContactTypeDto implements Omit<ContactTypes, "id"> {
  @ApiProperty()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsNotEmpty()
  title!: string;

  @ApiProperty()
  @IsNotEmpty()
  titleRu!: string;
}
