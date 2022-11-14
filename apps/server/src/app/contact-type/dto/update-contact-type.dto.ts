import { ApiPropertyOptional } from "@nestjs/swagger";
import { contact_types } from "@prisma/client";

export class UpdateContactTypeDto
  implements Partial<Omit<contact_types, "id">>
{
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  title_ru?: string;
}
