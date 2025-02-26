import { IsNotEmpty, Validate } from 'class-validator';
import { EqualsTo } from '../utils/equals-to';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordArgs {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @Validate(EqualsTo, ['password'])
  rePassword!: string;
}
