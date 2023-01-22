import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class SearchContactTypeQueryDto {
  @ApiProperty()
  @IsOptional()
  q?: string;
}
