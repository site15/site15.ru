import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { PrismaClientService } from "@site15/prisma/server";
import { Container } from "typedi";
import { DbInterface } from "../../database/db.interface";
import { DbService } from "../../database/db.service";

interface Data {
  entity: string;
  field: string;
}

@ValidatorConstraint({ async: true })
class ExistsConstraint implements ValidatorConstraintInterface {
  private dbService: DbInterface;
  constructor() {
    this.dbService = Container.get<DbInterface>(DbService);
  }
  async validate(
    currentValue: unknown,
    args?: ValidationArguments
  ): Promise<boolean> {
    const entity = args?.constraints[0]?.entity;
    const field = args?.constraints[0]?.field;
    return !(await this.dbService.isAlreadyExist(currentValue, entity, field));
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    const data = validationArguments?.constraints[0];
    return `${data.entity} field ${validationArguments?.value} is found.`;
  }
}

export function IsAlreadyExist(
  data: Data,
  validationOptions?: ValidationOptions
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (object: Object, propertyName: string) =>
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [data],
      validator: ExistsConstraint,
    });
}
