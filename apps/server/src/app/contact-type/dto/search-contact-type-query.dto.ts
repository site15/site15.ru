import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SearchContactTypeQueryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  q?: string;
}
