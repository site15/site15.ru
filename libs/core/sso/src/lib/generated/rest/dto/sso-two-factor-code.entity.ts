import { ApiProperty } from '@nestjs/swagger';
import { SsoProject } from './sso-project.entity';
import { SsoUser } from './sso-user.entity';

export class SsoTwoFactorCode {
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
  })
  userId!: string;
  @ApiProperty({
    type: 'string',
  })
  projectId!: string;
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
    type: () => SsoProject,
    required: false,
  })
  SsoProject?: SsoProject;
  @ApiProperty({
    type: () => SsoUser,
    required: false,
  })
  SsoUser?: SsoUser;
}
