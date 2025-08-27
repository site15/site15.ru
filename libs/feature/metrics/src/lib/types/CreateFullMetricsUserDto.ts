import { IsNotEmpty, IsString } from 'class-validator';
import { CreateMetricsUserDto } from '../generated/rest/dto/create-metrics-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFullMetricsUserDto extends CreateMetricsUserDto {}
