import { isInfrastructureMode } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaClient } from '@prisma/sso-client';
import { SSO_FEATURE } from '../sso.constants';
import { SsoStaticEnvironments } from '../sso.environments';

@Injectable()
export class SsoServiceBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(SsoServiceBootstrap.name);

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments
  ) {}

  async onApplicationBootstrap() {
    if (isInfrastructureMode()) {
      return;
    }

    await this.createDefaultProjects();
  }

  private async createDefaultProjects() {
    try {
      if (
        this.ssoStaticEnvironments.defaultClientId &&
        this.ssoStaticEnvironments.defaultClientSecret
      ) {
        const existsUser = await this.prismaClient.ssoProject.findFirst({
          where: {
            clientId: this.ssoStaticEnvironments.defaultClientId,
            clientSecret: this.ssoStaticEnvironments.defaultClientSecret,
          },
        });
        if (!existsUser) {
          await this.prismaClient.ssoProject.create({
            data: {
              clientId: this.ssoStaticEnvironments.defaultClientId,
              clientSecret: this.ssoStaticEnvironments.defaultClientSecret,
            },
          });
          this.logger.log('Defaul projects created!');
        }
      }
    } catch (err) {
      this.logger.error(err, (err as Error).stack);
    }
  }
}
