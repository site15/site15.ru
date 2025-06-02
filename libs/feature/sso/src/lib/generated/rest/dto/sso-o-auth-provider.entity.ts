import { ApiProperty } from '@nestjs/swagger';
import { SsoOAuthProviderSettings } from './sso-o-auth-provider-settings.entity';
import { SsoOAuthToken } from './sso-o-auth-token.entity';

export class SsoOAuthProvider {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  name!: string;
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
    type: () => SsoOAuthProviderSettings,
    isArray: true,
    required: false,
  })
  SsoOAuthProviderSettings?: SsoOAuthProviderSettings[];
  @ApiProperty({
    type: () => SsoOAuthToken,
    isArray: true,
    required: false,
  })
  SsoOAuthToken?: SsoOAuthToken[];
}
