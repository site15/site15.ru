import { isInfrastructureMode } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/sso-client';
import { SSO_FEATURE } from '../sso.constants';
import { SsoStaticEnvironments } from '../sso.environments';
import { SsoCacheService } from './sso-cache.service';
import { SsoProjectService } from './sso-project.service';

@Injectable()
export class SsoServiceBootstrap implements OnModuleInit {
  private readonly logger = new Logger(SsoServiceBootstrap.name);

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly ssoCacheService: SsoCacheService,
    private readonly ssoProjectService: SsoProjectService
  ) {}

  async onModuleInit() {
    this.logger.debug('onModuleInit');

    if (isInfrastructureMode()) {
      return;
    }

    await this.ssoProjectService.getOrCreateDefaultProject();

    await this.createDefaultPublicProjects();
  }

  private async createDefaultPublicProjects() {
    for (const defaultPublicProject of this.ssoStaticEnvironments
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
              nameLocale: defaultPublicProject.nameLocale,
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
