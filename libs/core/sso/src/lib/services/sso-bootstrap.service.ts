import { isInfrastructureMode } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/sso-client';
import { SSO_FEATURE } from '../sso.constants';
import { SsoStaticEnvironments } from '../sso.environments';
import { SsoCacheService } from './sso-cache.service';

@Injectable()
export class SsoServiceBootstrap implements OnModuleInit {
  private readonly logger = new Logger(SsoServiceBootstrap.name);

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly ssoCacheService: SsoCacheService
  ) {}

  async onModuleInit() {
    if (isInfrastructureMode()) {
      return;
    }

    await this.createDefaultProjects();
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
              name: this.ssoStaticEnvironments.defaultClientName,
              clientId: this.ssoStaticEnvironments.defaultClientId,
              clientSecret: this.ssoStaticEnvironments.defaultClientSecret,
            },
          });
          await this.ssoCacheService.getCachedProject(
            this.ssoStaticEnvironments.defaultClientId
          );
          this.logger.log('Defaul projects created!');
        }
      }
    } catch (err) {
      this.logger.error(err, (err as Error).stack);
    }
  }
}
