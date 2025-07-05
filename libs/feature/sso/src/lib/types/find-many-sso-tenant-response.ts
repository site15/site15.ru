import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { SsoTenantDto } from '../generated/rest/dto/sso-tenant.dto';

export class FindManySsoTenantResponse {
  @ApiProperty({ type: () => [SsoTenantDto] })
  ssoTenants!: SsoTenantDto[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
