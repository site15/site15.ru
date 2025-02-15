import { FindManyResponseMeta } from '@nestjs-mod-sso/common';
import { ApiProperty } from '@nestjs/swagger';
import { AuthUser } from '../generated/rest/dto/auth-user.entity';

export class FindManyAuthUserResponse {
  @ApiProperty({ type: () => [AuthUser] })
  authUsers!: AuthUser[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
