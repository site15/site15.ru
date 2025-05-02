import { isInfrastructureMode } from '@nestjs-mod/common';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SsoProjectService } from './sso-project.service';
import { SsoUsersService } from './sso-users.service';

@Injectable()
export class SsoServiceBootstrap implements OnModuleInit {
  private readonly logger = new Logger(SsoServiceBootstrap.name);

  constructor(
    private readonly ssoProjectService: SsoProjectService,
    private readonly ssoUsersService: SsoUsersService
  ) {}

  async onModuleInit() {
    const moduleInit = async () => {
      this.logger.debug('onModuleInit');

      if (isInfrastructureMode()) {
        return;
      }

      await this.ssoProjectService.getOrCreateDefaultProject();

      await this.ssoProjectService.createDefaultPublicProjects();

      await this.ssoUsersService.createAdmin();
    };

    moduleInit().catch((err) => this.logger.error(err, err.stack));
  }
}
