import { Controller, Get } from "@nestjs/common";
import { PrismaClientService } from "@site15/prisma/server";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaClientService
  ) {}

  @Get("hello")
  getData(): { message: string } {
    return this.appService.getData();
  }

  @Get("db")
  getDbData() {
    return this.prismaService.projectTypes.findMany({
      select: { id: true, name: true },
    });
  }
}
