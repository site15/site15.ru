import { Prisma } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';
import { SsoProject } from './sso-project.entity';

export class SsoEmailTemplate {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  subject!: string;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  subjectLocale!: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'string',
  })
  text!: string;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  textLocale!: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'string',
  })
  html!: string;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  htmlLocale!: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  operationName!: string | null;
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
}
