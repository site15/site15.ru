import { DbInterface } from "./db.interface";
import { Service } from "typedi";
import { PrismaClientService } from "@site15/prisma/server";

@Service()
export class DbService implements DbInterface {
  static instance: DbInterface;
  private readonly prismaClintService: PrismaClientService;
  constructor() {
    DbService.instance = this;
    this.prismaClintService = PrismaClientService.instance;
  }

  async isAlreadyExist(
    value: unknown,
    entity: string,
    field: string
  ): Promise<boolean> {
    const data = await this.prismaClintService[entity].findFirst({
      where: {
        [field]: value,
      },
    });
    return !!data;
  }
}
