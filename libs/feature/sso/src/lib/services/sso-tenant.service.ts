import { Injectable, Logger } from '@nestjs/common';
import { SsoConfiguration } from '../sso.configuration';
import { SsoStaticEnvironments } from '../sso.environments';
import { SsoError } from '../sso.errors';
import { SsoRequest } from '../types/sso-request';
import { SsoCacheService } from './sso-cache.service';

import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { SSO_FEATURE } from '../sso.constants';
import { SsoPrismaSdk } from '../sso.prisma-sdk';
import { SsoTemplatesService } from './sso-templates.service';
@Injectable()
export class SsoTenantService {
  private readonly logger = new Logger(SsoTenantService.name);

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: SsoPrismaSdk.PrismaClient,
    private readonly ssoConfiguration: SsoConfiguration,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly ssoCacheService: SsoCacheService,
    private readonly ssoTemplatesService: SsoTemplatesService,
  ) {}

  async createDefaultPublicTenants() {
    for (const defaultPublicTenant of this.ssoStaticEnvironments.defaultPublicTenants || []) {
      try {
        const existsTenant = await this.prismaClient.ssoTenant.findFirst({
          where: {
            name: defaultPublicTenant.name,
          },
        });
        if (existsTenant) {
          await this.ssoTemplatesService.createTenantDefaultEmailTemplates(existsTenant.id);
        }
        if (!existsTenant) {
          const result = await this.prismaClient.ssoTenant.create({
            data: {
              public: true,
              name: defaultPublicTenant.name,
              nameLocale: defaultPublicTenant.nameLocale,
              clientId: defaultPublicTenant.clientId,
              clientSecret: defaultPublicTenant.clientSecret,
              enabled: true,
              slug: defaultPublicTenant.name,
            },
          });

          await this.ssoTemplatesService.createTenantDefaultEmailTemplates(result.id);

          await this.ssoCacheService.clearCacheTenantByClientId(defaultPublicTenant.clientId);
          await this.ssoCacheService.getCachedTenant(defaultPublicTenant.clientId);
        }
      } catch (err) {
        this.logger.error(err, (err as Error).stack);
      }
    }
    this.logger.log('Default public tenants created!');
  }

  async getTenantByRequest(req: SsoRequest) {
    req.ssoClientId = this.getClientIdFromRequest(req);
    req.ssoClientSecret = this.getClientSecretFromRequest(req);

    if (!req.ssoClientId && this.ssoStaticEnvironments.defaultTenant?.clientId) {
      req.ssoClientId = this.ssoStaticEnvironments.defaultTenant?.clientId;
    }

    if (!req.ssoClientSecret && this.ssoStaticEnvironments.defaultTenant?.clientSecret) {
      req.ssoClientSecret = this.ssoStaticEnvironments.defaultTenant?.clientSecret;
    }

    if (req.ssoClientId) {
      const tenant = await this.ssoCacheService.getCachedTenant(req.ssoClientId);
      if (tenant) {
        req.ssoTenant = tenant;
      } else {
        throw new SsoError('Tenant not found');
      }
    }
    return req.ssoTenant;
  }

  private getClientSecretFromRequest(req: SsoRequest) {
    return (
      req.ssoClientSecret ||
      (this.ssoConfiguration.clientSecretHeaderName && req.headers?.[this.ssoConfiguration.clientSecretHeaderName])
    );
  }

  private getClientIdFromRequest(req: SsoRequest) {
    return (
      req.ssoClientId ||
      (this.ssoConfiguration.clientIdHeaderName && req.headers?.[this.ssoConfiguration.clientIdHeaderName])
    );
  }

  async getOrCreateDefaultTenant() {
    if (
      this.ssoStaticEnvironments.defaultTenant?.name &&
      this.ssoStaticEnvironments.defaultTenant?.clientId &&
      this.ssoStaticEnvironments.defaultTenant?.clientSecret
    ) {
      const existsTenant = await this.prismaClient.ssoTenant.findFirst({
        where: {
          clientId: this.ssoStaticEnvironments.defaultTenant?.clientId,
          clientSecret: this.ssoStaticEnvironments.defaultTenant?.clientSecret,
        },
      });
      if (existsTenant) {
        return existsTenant;
      }
      const result = await this.prismaClient.ssoTenant.create({
        data: {
          public: false,
          name: this.ssoStaticEnvironments.defaultTenant?.name,
          nameLocale: this.ssoStaticEnvironments.defaultTenant.nameLocale,
          clientId: this.ssoStaticEnvironments.defaultTenant?.clientId,
          clientSecret: this.ssoStaticEnvironments.defaultTenant?.clientSecret,
          enabled: true,
          slug: this.ssoStaticEnvironments.defaultTenant.slug,
        },
      });

      await this.ssoTemplatesService.createTenantDefaultEmailTemplates(result.id);
      await this.ssoCacheService.clearCacheTenantByClientId(this.ssoStaticEnvironments.defaultTenant?.clientId);

      const tenant = await this.ssoCacheService.getCachedTenant(this.ssoStaticEnvironments.defaultTenant?.clientId);

      this.logger.log('Default tenant created!');

      return tenant;
    }
    return null;
  }
}
