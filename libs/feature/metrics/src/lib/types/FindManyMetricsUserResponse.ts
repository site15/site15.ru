import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { MetricsUser } from '../generated/rest/dto/metrics-user.entity';

export class FindManyMetricsUserResponse {
  @ApiProperty({ type: () => [MetricsUser] })
  metricsUsers!: MetricsUser[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
