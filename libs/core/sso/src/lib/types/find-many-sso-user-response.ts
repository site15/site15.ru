import { FindManyResponseMeta } from '@nestjs-mod-sso/common';
import { ApiProperty } from '@nestjs/swagger';
import { SsoUser } from '../generated/rest/dto/sso-user.entity';

export class FindManySsoUserResponse {
  @ApiProperty({ type: () => [SsoUser] })
  ssoUsers!: SsoUser[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
