import { FindManyResponseMeta } from '@nestjs-mod-sso/common';
import { ApiProperty } from '@nestjs/swagger';
import { SsoProject } from '../generated/rest/dto/sso-project.entity';

export class FindManySsoProjectResponse {
  @ApiProperty({ type: () => [SsoProject] })
  ssoProjects!: SsoProject[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
