import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { MetricsUserDto } from '../generated/rest/dto/metrics-user.dto';

export class FindManyMetricsUserResponse {
  @ApiProperty({
    type: () => [MetricsUserDto],
  })
  metricsUsers!: MetricsUserDto[];

  @ApiProperty({
    type: () => FindManyResponseMeta,
  })
  meta!: FindManyResponseMeta;
}
