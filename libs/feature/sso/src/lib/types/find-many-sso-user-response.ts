import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { SsoUserDto } from '../generated/rest/dto/sso-user.dto';

export class FindManySsoUserResponse {
  @ApiProperty({ type: () => [SsoUserDto] })
  ssoUsers!: SsoUserDto[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
