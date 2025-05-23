import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { SsoRefreshSessionDto } from '../generated/rest/dto/sso-refresh-session.dto';

export class FindManySsoRefreshSessionResponse {
  @ApiProperty({ type: () => [SsoRefreshSessionDto] })
  ssoRefreshSessions!: SsoRefreshSessionDto[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
