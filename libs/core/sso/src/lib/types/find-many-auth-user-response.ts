import { FindManyResponseMeta } from '@nestjs-mod-sso/common';
import { ApiProperty } from '@nestjs/swagger';
import { SsoUser } from '../generated/rest/dto/sso-user.entity';

export class FindManyAuthUserResponse {
  @ApiProperty({ type: () => [SsoUser] })
  authUsers!: SsoUser[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
