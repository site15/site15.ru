import { Injectable } from '@nestjs/common';
import { SsoConfiguration } from '../sso.configuration';
import { SsoStaticEnvironments } from '../sso.environments';
import { SsoError } from '../sso.errors';
import { SsoRequest } from '../types/sso-request';
import { SsoCacheService } from './sso-cache.service';

import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaClient } from '@prisma/sso-client';
import { SSO_FEATURE } from '../sso.constants';
@Injectable()
export class SsoProjectService {
  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly ssoConfiguration: SsoConfiguration,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly ssoCacheService: SsoCacheService
  ) {}

  async getProjectByRequest(req: SsoRequest) {
    req.ssoClientId = this.getClientIdFromRequest(req);
    req.ssoClientSecret = this.getClientSecretFromRequest(req);

    if (
      !req.ssoClientId &&
      this.ssoStaticEnvironments.defaultProject?.clientId
    ) {
      req.ssoClientId = this.ssoStaticEnvironments.defaultProject?.clientId;
    }

    if (
      !req.ssoClientSecret &&
      this.ssoStaticEnvironments.defaultProject?.clientSecret
    ) {
      req.ssoClientSecret =
        this.ssoStaticEnvironments.defaultProject?.clientSecret;
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

  async getOrCreateDefaultProject() {
    if (
      this.ssoStaticEnvironments.defaultProject?.name &&
      this.ssoStaticEnvironments.defaultProject?.clientId &&
      this.ssoStaticEnvironments.defaultProject?.clientSecret
    ) {
      const existsProject = await this.prismaClient.ssoProject.findFirst({
        where: {
          clientId: this.ssoStaticEnvironments.defaultProject?.clientId,
          clientSecret: this.ssoStaticEnvironments.defaultProject?.clientSecret,
        },
      });
      if (!existsProject) {
        await this.prismaClient.ssoProject.create({
          data: {
            public: false,
            name: this.ssoStaticEnvironments.defaultProject?.name,
            nameLocale: this.ssoStaticEnvironments.defaultProject.nameLocale,
            clientId: this.ssoStaticEnvironments.defaultProject?.clientId,
            clientSecret:
              this.ssoStaticEnvironments.defaultProject?.clientSecret,
          },
        });
        await this.ssoCacheService.clearCacheProjectByClientId(
          this.ssoStaticEnvironments.defaultProject?.clientId
        );
        return await this.ssoCacheService.getCachedProject(
          this.ssoStaticEnvironments.defaultProject?.clientId
        );
      }
      return existsProject;
    }
    return null;
  }
}
