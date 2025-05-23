import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { SsoPublicProjectDto } from './sso-public-project.dto';

export class FindManySsoPublicProjectResponse {
  @ApiProperty({ type: () => [SsoPublicProjectDto] })
  ssoPublicProjects!: SsoPublicProjectDto[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
