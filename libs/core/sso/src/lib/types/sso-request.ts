import { SsoProject } from '../generated/rest/dto/sso-project.entity';
import { SsoUser } from '../generated/rest/dto/sso-user.entity';

export type SsoAccessTokenData = {
  userId: string;
  projectId: string;
  roles?: string;
  refreshToken: string;
};

export type SsoRequest = {
  ssoProject: SsoProject;
  ssoUser?: SsoUser;
  ssoClientId?: string;
  ssoClientSecret?: string;
  ssoAccessTokenData?: SsoAccessTokenData;
  skipEmptySsoUser?: boolean;
  skipThrottle?: boolean;
  headers: Record<string, string>;
};
