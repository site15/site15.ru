import { FindManyResponseMeta } from '@nestjs-mod/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { SsoEmailTemplateDto } from '../generated/rest/dto/sso-email-template.dto';

export class FindManySsoEmailTemplateResponse {
  @ApiProperty({ type: () => [SsoEmailTemplateDto] })
  ssoEmailTemplates!: SsoEmailTemplateDto[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
