import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { getText } from 'nestjs-translates';

export enum MetricsErrorEnum {
  COMMON = 'METRICS-000',
  FORBIDDEN = 'METRICS-001',
  EXTERNAL_USER_ID_NOT_SET = 'METRICS-002',
  EXTERNAL_TENANT_ID_NOT_SET = 'METRICS-003',
  USER_NOT_FOUND = 'METRICS-004',
}

export const METRICS_ERROR_ENUM_TITLES: Record<MetricsErrorEnum, string> = {
  [MetricsErrorEnum.COMMON]: getText('Metrics error'),
  [MetricsErrorEnum.EXTERNAL_TENANT_ID_NOT_SET]: getText('Tenant ID not set'),
  [MetricsErrorEnum.EXTERNAL_USER_ID_NOT_SET]: getText('User ID not set'),
  [MetricsErrorEnum.FORBIDDEN]: getText('Forbidden'),
  [MetricsErrorEnum.USER_NOT_FOUND]: getText('User not found'),
};

export class MetricsError<T = unknown> extends Error {
  @ApiProperty({
    type: String,
    description: Object.entries(METRICS_ERROR_ENUM_TITLES)
      .map(([key, value]) => `${value} (${key})`)
      .join(', '),
    example: METRICS_ERROR_ENUM_TITLES[MetricsErrorEnum.COMMON],
  })
  override message: string;

  @ApiProperty({
    enum: MetricsErrorEnum,
    enumName: 'MetricsErrorEnum',
    example: MetricsErrorEnum.COMMON,
  })
  code = MetricsErrorEnum.COMMON;

  @ApiPropertyOptional({ type: Object })
  metadata?: T;

  constructor(message?: string | MetricsErrorEnum, code?: MetricsErrorEnum, metadata?: T) {
    const messageAsCode = Boolean(message && Object.values(MetricsErrorEnum).includes(message as MetricsErrorEnum));
    const preparedCode = messageAsCode ? (message as MetricsErrorEnum) : code;
    const preparedMessage = messageAsCode && preparedCode ? METRICS_ERROR_ENUM_TITLES[preparedCode] : message;

    code = preparedCode || MetricsErrorEnum.COMMON;
    message = preparedMessage || METRICS_ERROR_ENUM_TITLES[code];

    super(message);

    this.code = code;
    this.message = message;
    this.metadata = metadata;
  }
}
