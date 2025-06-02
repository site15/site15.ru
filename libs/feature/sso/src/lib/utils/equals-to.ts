import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { getText } from 'nestjs-translates';

@ValidatorConstraint({ name: 'equalsTo', async: false })
export class EqualsTo implements ValidatorConstraintInterface {
  validate(value: string, validationArguments: ValidationArguments): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj: any = validationArguments.object;
    return (
      validationArguments.constraints.length > 0 &&
      validationArguments.constraints.filter(
        (otherField) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          obj.hasOwnProperty!(otherField) && obj[otherField] === value
      ).length > 0
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(validationArguments: ValidationArguments): string {
    return getText('$constraint1 do not match to $property');
  }
}
