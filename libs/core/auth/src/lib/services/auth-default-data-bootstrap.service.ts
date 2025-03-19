import { isInfrastructureMode } from '@nestjs-mod/common';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { AuthConfiguration } from '../auth.configuration';
import { AuthStaticEnvironments } from '../auth.environments';

@Injectable()
export class AuthDefaultDataBootstrapService implements OnApplicationBootstrap {
  private logger = new Logger(AuthDefaultDataBootstrapService.name);

  constructor(
    private readonly authConfiguration: AuthConfiguration,
    private readonly authStaticEnvironments: AuthStaticEnvironments
  ) {}

  async onApplicationBootstrap() {
    this.logger.debug('onApplicationBootstrap');

    if (!isInfrastructureMode()) {
      try {
        await this.createAdmin();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        this.logger.error(err, err.stack);
      }
    }
  }

  private async createAdmin() {
    try {
      if (
        this.authStaticEnvironments.adminEmail &&
        this.authStaticEnvironments.adminPassword
      ) {
        await this.authConfiguration.createAdmin({
          username: this.authStaticEnvironments.adminUsername,
          password: this.authStaticEnvironments.adminPassword,
          email: this.authStaticEnvironments.adminEmail,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
    }
  }
}
