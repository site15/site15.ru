import { isInfrastructureMode } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaClient } from '@prisma/sso-client';
import { SsoConfiguration } from '../sso.configuration';
import { SSO_FEATURE } from '../sso.constants';
import { SsoStaticEnvironments } from '../sso.environments';
import { SsoCacheService } from './sso-cache.service';

@Injectable()
export class SsoServiceBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(SsoServiceBootstrap.name);

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly ssoConfiguration: SsoConfiguration,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly ssoCacheService: SsoCacheService
  ) {}

  async onApplicationBootstrap() {
    this.logger.debug('onApplicationBootstrap');

    if (isInfrastructureMode()) {
      return;
    }

    await this.createDefaultProjects();

    await this.createDefaultPublicProjects();
  }

  private async createDefaultProjects() {
    try {
      if (
        this.ssoStaticEnvironments.defaultClientName &&
        this.ssoStaticEnvironments.defaultClientId &&
        this.ssoStaticEnvironments.defaultClientSecret
      ) {
        const existsProject = await this.prismaClient.ssoProject.findFirst({
          where: {
            clientId: this.ssoStaticEnvironments.defaultClientId,
            clientSecret: this.ssoStaticEnvironments.defaultClientSecret,
          },
        });
        if (!existsProject) {
          await this.prismaClient.ssoProject.create({
            data: {
              public: false,
              name: this.ssoStaticEnvironments.defaultClientName,
              clientId: this.ssoStaticEnvironments.defaultClientId,
              clientSecret: this.ssoStaticEnvironments.defaultClientSecret,
            },
          });
          await this.ssoCacheService.clearCacheProjectByClientId(
            this.ssoStaticEnvironments.defaultClientId
          );
          await this.ssoCacheService.getCachedProject(
            this.ssoStaticEnvironments.defaultClientId
          );
          this.logger.log('Default projects created!');
        }
      }
    } catch (err) {
      this.logger.error(err, (err as Error).stack);
    }
  }

  private async createDefaultPublicProjects() {
    for (const defaultPublicProject of this.ssoConfiguration
      .defaultPublicProjects || []) {
      try {
        const existsProject = await this.prismaClient.ssoProject.findFirst({
          where: {
            name: defaultPublicProject.name,
          },
        });
        if (!existsProject) {
          await this.prismaClient.ssoProject.create({
            data: {
              public: true,
              name: defaultPublicProject.name,
              clientId: defaultPublicProject.clientId,
              clientSecret: defaultPublicProject.clientSecret,
            },
          });
          await this.ssoCacheService.clearCacheProjectByClientId(
            defaultPublicProject.clientId
          );
          await this.ssoCacheService.getCachedProject(
            defaultPublicProject.clientId
          );
        }
      } catch (err) {
        this.logger.error(err, (err as Error).stack);
      }
    }
    this.logger.log('Default public projects created!');
  }
}
