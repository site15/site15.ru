import { Module } from "@nestjs/common";
import { ContactTypeService } from "./contact-type.service";
import { ContactTypeController } from "./contact-type.controller";

@Module({
  controllers: [ContactTypeController],
  providers: [ContactTypeService],
})
export class ContactTypeModule {}
