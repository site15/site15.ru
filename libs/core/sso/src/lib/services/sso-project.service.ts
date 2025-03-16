import { Injectable } from '@nestjs/common';
import { SsoConfiguration } from '../sso.configuration';
import { SsoStaticEnvironments } from '../sso.environments';
import { SsoError } from '../sso.errors';
import { SsoRequest } from '../types/sso-request';
import { SsoCacheService } from './sso-cache.service';

@Injectable()
export class SsoProjectService {
  constructor(
    private readonly ssoConfiguration: SsoConfiguration,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly ssoCacheService: SsoCacheService
  ) {}

  async getProjectByRequest(req: SsoRequest) {
    req.ssoClientId = this.getClientIdFromRequest(req);
    req.ssoClientSecret = this.getClientSecretFromRequest(req);

    if (!req.ssoClientId && this.ssoStaticEnvironments.defaultClientId) {
      req.ssoClientId = this.ssoStaticEnvironments.defaultClientId;
    }

    if (
      !req.ssoClientSecret &&
      this.ssoStaticEnvironments.defaultClientSecret
    ) {
      req.ssoClientSecret = this.ssoStaticEnvironments.defaultClientSecret;
    }

    if (req.ssoClientId) {
      const project = await this.ssoCacheService.getCachedProject(
        req.ssoClientId
      );
      if (project) {
        req.ssoProject = project;
      } else {
        throw new SsoError('Project not found');
      }
    }
    return req.ssoProject;
  }

  private getClientSecretFromRequest(req: SsoRequest) {
    return (
      req.ssoClientSecret ||
      (this.ssoConfiguration.clientSecretHeaderName &&
        req.headers?.[this.ssoConfiguration.clientSecretHeaderName])
    );
  }

  private getClientIdFromRequest(req: SsoRequest) {
    return (
      req.ssoClientId ||
      (this.ssoConfiguration.clientIdHeaderName &&
        req.headers?.[this.ssoConfiguration.clientIdHeaderName])
    );
  }
}
