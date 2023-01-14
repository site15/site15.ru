import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaClientService } from "@site15/prisma/server";

import { ContactTypeDto } from "./dto/contact-type.dto";
import { IContactType } from "./interfaces/contact-type.interface";
import { IStatus } from "./interfaces/status.interface";

@Injectable()
export class ContactTypeService {
  private readonly logger = new Logger(ContactTypeService.name);

  constructor(private readonly prismaClient: PrismaClientService) {}

  async create(contactTypeDto: ContactTypeDto): Promise<IContactType> {
    try {
      return await this.prismaClient.contactTypes.create({
        data: contactTypeDto,
      });
    } catch (err) {
      this.logger.error(err, err.stack);
      throw new InternalServerErrorException({
        message: "UNKNOWN_ERROR",
      });
    }
  }

  async findAll(): Promise<IContactType[]> {
    return await this.prismaClient.contactTypes.findMany();
  }

  async findOne(id: number): Promise<IContactType> {
    try {
      {
        return await this.prismaClient.contactTypes.findFirstOrThrow({
          where: {
            id,
          },
        });
      }
    } catch (err) {
      if (err instanceof Prisma.NotFoundError) {
        throw new NotFoundException({
          message: "NOT_FOUND",
          description: `Contact type with id: ${id} not found`,
        });
      }

      this.logger.error(err, err.stack);
      throw new InternalServerErrorException({
        message: "UNKNOWN_ERROR",
      });
    }
  }

  async update(
    id: number,
    contactTypeDto: ContactTypeDto
  ): Promise<IContactType> {
    try {
      return await this.prismaClient.contactTypes.update({
        where: { id },
        data: contactTypeDto,
      });
    } catch (err) {
      /**
       * Prisma.NotFoundError returns false.
       * So, i decided to try Prisma.PrismaClientKnownRequestError.
       */
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException({
          message: "NOT_FOUND",
          description: `Contact type with id: ${id} not found`,
        });
      }

      this.logger.error(err, err.stack);
      throw new InternalServerErrorException({
        message: "UNKNOWN_ERROR",
      });
    }
  }

  async remove(id: number): Promise<IStatus> {
    try {
      await this.prismaClient.contactTypes.delete({
        where: { id },
      });

      return {
        status: "OK",
      };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException({
          message: "NOT_FOUND",
          description: `Contact type with id: ${id} not found`,
        });
      }

      this.logger.error(err, err.stack);
      throw new InternalServerErrorException({
        message: "UNKNOWN_ERROR",
      });
    }
  }
}
