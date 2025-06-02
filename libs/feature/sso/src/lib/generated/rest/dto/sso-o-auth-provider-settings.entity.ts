import { ApiProperty } from '@nestjs/swagger';
import { SsoOAuthProvider } from './sso-o-auth-provider.entity';

export class SsoOAuthProviderSettings {
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
  })
  value!: string;
  @ApiProperty({
    type: 'string',
  })
  providerId!: string;
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
    type: () => SsoOAuthProvider,
    required: false,
  })
  SsoOAuthProvider?: SsoOAuthProvider;
}
