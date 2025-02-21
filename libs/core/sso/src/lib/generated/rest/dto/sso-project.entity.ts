import { ApiProperty } from '@nestjs/swagger';
import { SsoUser } from './sso-user.entity';

export class SsoProject {
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
  @ApiProperty({
    type: () => SsoUser,
    isArray: true,
    required: false,
  })
  SsoUser?: SsoUser[];
}
