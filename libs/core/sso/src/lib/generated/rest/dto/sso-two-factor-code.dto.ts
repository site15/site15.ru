import { ApiProperty } from '@nestjs/swagger';

export class SsoTwoFactorCodeDto {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  operationName!: string;
  @ApiProperty({
    type: 'string',
  })
  type!: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  maxAttempt!: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  attempt!: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  timeout!: number;
  @ApiProperty({
    type: 'boolean',
  })
  used!: boolean;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt!: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt!: Date;
}
