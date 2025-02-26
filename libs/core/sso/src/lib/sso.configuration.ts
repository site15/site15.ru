import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';

@ConfigModel()
export class SsoStaticConfiguration {
  @ConfigModelProperty({
    description: 'TTL for cached data',
    default: 15_000,
  })
  cacheTTL?: number;

  @ConfigModelProperty({
    description:
      'The name of the header key that stores the register client ID',
    default: 'x-client-id',
  })
  clientIdHeaderName?: string;

  @ConfigModelProperty({
    description:
      'The name of the header key that stores the register client secret',
    default: 'x-client-secret',
  })
  clientSecretHeaderName?: string;

  @ConfigModelProperty({
    description: 'The name of the header key that stores the admin secret key',
    default: 'x-admin-secret',
  })
  adminSecretHeaderName?: string;
}
