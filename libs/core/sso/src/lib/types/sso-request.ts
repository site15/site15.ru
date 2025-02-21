import { SsoProject } from '../generated/rest/dto/sso-project.entity';
import { SsoUser } from '../generated/rest/dto/sso-user.entity';

export type SsoRequest = {
  ssoUser: SsoUser;
  ssoProject: SsoProject;
  ssoIsAdmin: boolean;
  headers: Record<string, string>;
};
