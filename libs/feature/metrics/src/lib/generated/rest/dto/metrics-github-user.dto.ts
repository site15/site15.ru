import { ApiProperty } from '@nestjs/swagger';

export class MetricsGithubUserDto {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  login!: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  name!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  email!: string | null;
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
    type: 'string',
  })
  tenantId!: string;
}
