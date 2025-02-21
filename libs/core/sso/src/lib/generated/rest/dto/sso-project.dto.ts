import { ApiProperty } from '@nestjs/swagger';

export class SsoProjectDto {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  clientId!: string;
  @ApiProperty({
    type: 'string',
  })
  clientSecret!: string;
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
