import { OmitType } from '@nestjs/swagger';
import { SsoTenantDto } from '../generated/rest/dto/sso-tenant.dto';

export class SsoPublicTenantDto extends OmitType(SsoTenantDto, ['clientSecret', 'public']) {}
