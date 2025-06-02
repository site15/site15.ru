import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { SsoProjectDto } from '../generated/rest/dto/sso-project.dto';

export class FindManySsoProjectResponse {
  @ApiProperty({ type: () => [SsoProjectDto] })
  ssoProjects!: SsoProjectDto[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
