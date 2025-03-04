import { Injectable } from '@nestjs/common';
import { SsoConfiguration } from '../sso.configuration';
import { SsoStaticEnvironments } from '../sso.environments';
import { SsoRequest } from '../types/sso-request';

@Injectable()
export class SsoAdminService {
  constructor(
    private readonly ssoConfiguration: SsoConfiguration,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments
  ) {}

  checkAdminInRequest(req: SsoRequest) {
    if (
      this.ssoConfiguration.adminSecretHeaderName &&
      req.headers?.[this.ssoConfiguration.adminSecretHeaderName]
    ) {
      return (
        req.headers?.[this.ssoConfiguration.adminSecretHeaderName] ===
        this.ssoStaticEnvironments.adminSecret
      );
    }

    return undefined;
  }
}
