import { Prisma } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSsoProjectDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  @IsOptional()
  nameLocale?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  clientId!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  clientSecret!: string;
  @ApiProperty({
    type: 'boolean',
  })
  @IsNotEmpty()
  @IsBoolean()
  public!: boolean;
}
