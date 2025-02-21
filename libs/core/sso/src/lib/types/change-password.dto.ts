import { IsNotEmpty, Validate } from 'class-validator';
import { EqualsTo } from '../utils/equals-to';

export class ChangePasswordArgs {
  @IsNotEmpty()
  password!: string;

  @IsNotEmpty()
  @Validate(EqualsTo, ['password'])
  rePassword!: string;
}
