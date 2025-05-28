import { Prisma } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSsoRefreshSessionDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken!: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  userAgent?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  fingerprint?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  userIp?: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date | null;
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  @IsOptional()
  userData?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  @ApiProperty({
    type: 'boolean',
  })
  @IsNotEmpty()
  @IsBoolean()
  enabled!: boolean;
}
