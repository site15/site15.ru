import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaClientService } from "@site15/prisma/server";

import { CreateContactTypeDto } from "./dto/create-contact-type.dto";
import { UpdateContactTypeDto } from "./dto/update-contact-type.dto";
import { IContactType } from "./interfaces/contact-type.interface";
import { IStatus } from "./interfaces/status.interface";

@Injectable()
export class ContactTypeService {
  private readonly logger = new Logger(ContactTypeService.name);

  constructor(private readonly prismaClient: PrismaClientService) {}

  async create(
    createContactTypeDto: CreateContactTypeDto
  ): Promise<IContactType> {
    try {
      return await this.prismaClient.contact_types.create({
        data: createContactTypeDto,
      });
    } catch (err) {
      this.logger.error(err, err.stack);
      throw new InternalServerErrorException({
        message: "UNKNOWN_ERROR",
      });
    }
  }

  async findAll(): Promise<IContactType[]> {
    return await this.prismaClient.contact_types.findMany();
  }

  async findOne(id: number): Promise<IContactType> {
    try {
      {
        return await this.prismaClient.contact_types.findFirstOrThrow({
          where: {
            id,
          },
        });
      }
    } catch (err) {
      this.logger.error(err, err.stack);

      if (err instanceof Prisma.NotFoundError) {
        throw new NotFoundException({
          message: "NOT_FOUND",
          description: `Contact type with id: ${id} not found`,
        });
      } else {
        throw err;
      }
    }
  }

  async update(
    id: number,
    updateContactTypeDto: UpdateContactTypeDto
  ): Promise<IContactType> {
    try {
      return await this.prismaClient.contact_types.update({
        where: { id },
        data: updateContactTypeDto,
      });
    } catch (err) {
      this.logger.error(err, err.stack);

      /**
       * Prisma.NotFoundError returns false.
       * So, i decided to try Prisma.PrismaClientKnownRequestError.
       */
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException({
          message: "NOT_FOUND",
          description: `Contact type with id: ${id} not found`,
        });
      } else {
        throw new InternalServerErrorException({
          message: "UNKNOWN_ERROR",
        });
      }
    }
  }

  async remove(id: number): Promise<IStatus> {
    try {
      await this.prismaClient.contact_types.delete({
        where: { id },
      });

      return {
        status: "OK",
      };
    } catch (err) {
      this.logger.error(err, err.stack);

      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException({
          message: "NOT_FOUND",
          description: `Contact type with id: ${id} not found`,
        });
      } else {
        throw new InternalServerErrorException({
          message: "UNKNOWN_ERROR",
        });
      }
    }
  }
}
