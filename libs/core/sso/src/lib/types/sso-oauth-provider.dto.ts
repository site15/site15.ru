import { ApiProperty } from '@nestjs/swagger';
import { SsoOAuthProviderDto } from '../generated/rest/dto/sso-o-auth-provider.dto';

export class OAuthProvider extends SsoOAuthProviderDto {
  @ApiProperty({
    type: 'string',
  })
  url!: string;
}

export class FindManySsoOAuthProviderResponse {
  @ApiProperty({ type: () => [OAuthProvider] })
  ssoOAuthProvider!: OAuthProvider[];
}
