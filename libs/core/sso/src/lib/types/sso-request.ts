import { SsoProject } from '../generated/rest/dto/sso-project.entity';
import { SsoUser } from '../generated/rest/dto/sso-user.entity';

export type SsoAccessTokenData = {
  userId: string;
  roles: string;
};

export type SsoRequest = {
  ssoProject: SsoProject;
  ssoUser?: SsoUser;
  ssoIsAdmin?: boolean;
  ssoClientId?: string;
  ssoClientSecret?: string;
  ssoAccessTokenData?: SsoAccessTokenData;
  skipEmptySsoUser?: boolean;
  headers: Record<string, string>;
};
