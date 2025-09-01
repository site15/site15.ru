import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { MetricsSettingsDto } from '../generated/rest/dto/metrics-settings.dto';

export class FindManyMetricsSettingsResponse {
  @ApiProperty({
    type: () => [MetricsSettingsDto],
  })
  metricsSettings!: MetricsSettingsDto[];

  @ApiProperty({
    type: () => FindManyResponseMeta,
  })
  meta!: FindManyResponseMeta;
}
