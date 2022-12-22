import { ApiProperty } from "@nestjs/swagger";
import { contact_types } from "@prisma/client";
import { IsNotEmpty } from "class-validator";
import { DoesNotExist } from "../../shared/validators/does-not-exist";
export class ContactTypeDto implements Omit<contact_types, "id"> {
  @ApiProperty()
  @IsNotEmpty()
  @DoesNotExist(
    { entity: "contact_types", field: "name" },
    {
      message: ({ value, property }) =>
        `field ${property} with ${value} is found`,
    }
  )
  name!: string;

  @ApiProperty()
  @IsNotEmpty()
  title!: string;

  @ApiProperty()
  @IsNotEmpty()
  title_ru!: string;
}
