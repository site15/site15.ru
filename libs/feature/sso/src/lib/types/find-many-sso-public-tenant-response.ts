import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { SsoPublicTenantDto } from './sso-public-tenant.dto';

export class FindManySsoPublicTenantResponse {
  @ApiProperty({ type: () => [SsoPublicTenantDto] })
  ssoPublicTenants!: SsoPublicTenantDto[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
