import { SsoTenant } from '../generated/rest/dto/sso-tenant.entity';
import { SsoUser } from '../generated/rest/dto/sso-user.entity';

export type SsoAccessTokenData = {
  userId: string;
  tenantId: string;
  roles?: string;
  refreshToken: string;
};

export type SsoRequest = {
  ssoTenant: SsoTenant;
  ssoUser?: SsoUser;
  ssoClientId?: string;
  ssoClientSecret?: string;
  ssoAccessTokenData?: SsoAccessTokenData;
  skipEmptySsoUser?: boolean;
  skipThrottle?: boolean;
  skipEmailVerification?: boolean;
  allowChangeTwoFactorTimeout?: boolean;
  headers: Record<string, string>;
};
