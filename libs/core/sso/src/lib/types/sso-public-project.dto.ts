import { OmitType } from '@nestjs/swagger';
import { SsoProjectDto } from '../generated/rest/dto/sso-project.dto';

export class SsoPublicProjectDto extends OmitType(SsoProjectDto, [
  'clientSecret',
  'public',
]) {}
