import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaClientService } from "@site15/prisma/server";
import { CreateContactTypeDto } from "./dto/create-contact-type.dto";
import { UpdateContactTypeDto } from "./dto/update-contact-type.dto";

@Injectable()
export class ContactTypeService {
  private readonly logger = new Logger(ContactTypeService.name);

  constructor(private readonly prismaClient: PrismaClientService) {}

  async create(createContactTypeDto: CreateContactTypeDto) {
    try {
      const contactType = this.prismaClient.contact_types.create({
        data: createContactTypeDto,
      });

      return contactType;
    } catch (err) {
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  async findAll() {
    return await this.prismaClient.contact_types.findMany();
  }

  async findOne(id: number) {
    const user = this.prismaClient.contact_types.findFirst({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException({
        message: "NOT_FOUND",
        description: `Contact type with id: ${id} not found`,
      });
    }

    return user;
  }

  async update(id: number, updateContactTypeDto: UpdateContactTypeDto) {
    try {
      const isExist = await this.prismaClient.contact_types.update({
        where: { id },
        data: updateContactTypeDto,
      });

      if (!isExist) {
        throw new NotFoundException({
          message: "NOT_FOUND",
          description: `Contact type with id: ${id} not found`,
        });
      }

      return isExist;
    } catch (err) {
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  async remove(id: number) {
    try {
      await this.prismaClient.contact_types.delete({
        where: { id },
      });

      return true;
    } catch (err) {
      this.logger.error(err, err.stack);
      throw err;
    }
  }
}
