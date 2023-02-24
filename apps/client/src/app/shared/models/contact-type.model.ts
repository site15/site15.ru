import { Expose } from "class-transformer-global-storage";
import { IsNotEmpty, MaxLength } from "class-validator-multi-lang";

export interface IContactType {
  id: number;
  name: string;
  title: string;
  title_ru: string;
}

export class ContactType {
  @Expose()
  id!: number;

  @Expose()
  @IsNotEmpty({ message: "Name is required" })
  @MaxLength(20, {
    message: "Name's length should be less or equal to $constraint1.",
  })
  name!: string;

  @Expose()
  @IsNotEmpty({ message: "Title is required" })
  title!: string;

  @Expose()
  @IsNotEmpty({ message: "TitleRU is required" })
  title_ru!: string;
}
