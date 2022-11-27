import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
} from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";

import { ContactTypeService } from "./contact-type.service";
import { ContactTypeDto } from "./dto/contact-type.dto";
import { IContactType } from "./interfaces/contact-type.interface";
import { IStatus } from "./interfaces/status.interface";

@ApiTags("contact-type")
@Controller("contact-type")
export class ContactTypeController {
  constructor(private readonly contactTypeService: ContactTypeService) {}

  @ApiBody({ type: ContactTypeDto })
  @ApiResponse({ status: 201 })
  @Post()
  async create(@Body() contactTypeDto: ContactTypeDto): Promise<IContactType> {
    return await this.contactTypeService.create(contactTypeDto);
  }

  @ApiResponse({ status: 200 })
  @Get()
  async findAll(): Promise<IContactType[]> {
    return await this.contactTypeService.findAll();
  }

  @ApiResponse({ status: 200 })
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<IContactType> {
    return await this.contactTypeService.findOne(id);
  }

  @ApiBody({ type: ContactTypeDto })
  @ApiResponse({ status: 200 })
  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() contactTypeDto: ContactTypeDto
  ): Promise<IContactType> {
    return await this.contactTypeService.update(id, contactTypeDto);
  }

  @ApiResponse({ status: 200 })
  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number): Promise<IStatus> {
    return await this.contactTypeService.remove(id);
  }
}
