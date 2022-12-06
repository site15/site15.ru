import { Module } from "@nestjs/common";
import { ContactTypeService } from "./contact-type.service";
import { ContactTypeController } from "./contact-type.controller";
import { PrismaClientModule } from "@site15/prisma/server";

@Module({
  imports: [PrismaClientModule],
  controllers: [ContactTypeController],
  providers: [ContactTypeService],
})
export class ContactTypeModule {}
