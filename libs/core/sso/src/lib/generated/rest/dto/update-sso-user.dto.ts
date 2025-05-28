import { Prisma } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSsoUserDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  phone?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  username?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  roles?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  firstname?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  lastname?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  gender?: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  birthdate?: Date | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  picture?: string | null;
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  @IsOptional()
  appData?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  revokedAt?: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  emailVerifiedAt?: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  phoneVerifiedAt?: Date | null;
  @ApiProperty({
    type: 'number',
    format: 'float',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  timezone?: number | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  lang?: string | null;
}
