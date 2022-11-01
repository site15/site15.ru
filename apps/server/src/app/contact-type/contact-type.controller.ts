import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ContactTypeService } from "./contact-type.service";
import { CreateContactTypeDto } from "./dto/create-contact-type.dto";
import { UpdateContactTypeDto } from "./dto/update-contact-type.dto";

@ApiTags("contact-type")
@Controller("contact-type")
export class ContactTypeController {
  constructor(private readonly contactTypeService: ContactTypeService) {}

  @ApiBody({ type: [CreateContactTypeDto] })
  @ApiResponse({ status: 201 })
  @Post()
  async create(@Body() createContactTypeDto: CreateContactTypeDto) {
    return await this.contactTypeService.create(createContactTypeDto);
  }

  @ApiResponse({ status: 200 })
  @Get()
  async findAll() {
    return await this.contactTypeService.findAll();
  }

  @ApiResponse({ status: 200 })
  @Get(":id")
  async findOne(@Param("id") id: number) {
    return await this.contactTypeService.findOne(+id);
  }

  @ApiBody({ type: [UpdateContactTypeDto] })
  @ApiResponse({ status: 200 })
  @Patch(":id")
  async update(
    @Param("id") id: number,
    @Body() updateContactTypeDto: UpdateContactTypeDto
  ) {
    return await this.contactTypeService.update(+id, updateContactTypeDto);
  }

  @ApiResponse({ status: 200 })
  @Delete(":id")
  async remove(@Param("id") id: number) {
    return await this.contactTypeService.remove(+id);
  }
}
