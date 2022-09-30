import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from "@nestjs/common";
import env from "env-var";

@Controller()
export class VersionController {
  private _tag: string;

  constructor() {
    this._tag = env.get("TAG_VERSION").default("dev").asString();
  }

  @Get("/version")
  version(): { tag: string } {
    return {
      tag: this._tag,
    };
  }

  @Get("/version/check-tag/:tag")
  checkVersion(@Param("tag") tag: string): { message: string } {
    if (this._tag.toLowerCase() === tag.toLowerCase()) {
      return { message: "OK" };
    }
    throw new HttpException("Wrong tag", HttpStatus.BAD_REQUEST);
  }
}
