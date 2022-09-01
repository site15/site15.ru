import { Controller, Get } from "@nestjs/common";

import { AppService } from "./app.service";
import { PrismaService } from "./prisma.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService
  ) {}

  @Get("hello")
  getData(): { message: string } {
    return this.appService.getData();
  }

  @Get("db")
  getDbData() {
    return this.prismaService.project_types.findMany({
      select: { id: true, name: true },
    });
  }
}
