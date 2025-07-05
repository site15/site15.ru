import { isInfrastructureMode } from '@nestjs-mod/common';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SsoTenantService } from './sso-tenant.service';
import { SsoUsersService } from './sso-users.service';

@Injectable()
export class SsoServiceBootstrap implements OnModuleInit {
  private readonly logger = new Logger(SsoServiceBootstrap.name);

  constructor(
    private readonly ssoTenantService: SsoTenantService,
    private readonly ssoUsersService: SsoUsersService,
  ) {}

  async onModuleInit() {
    this.logger.debug('onModuleInit');

    if (isInfrastructureMode()) {
      return;
    }

    await this.ssoTenantService.getOrCreateDefaultTenant();

    await this.ssoTenantService.createDefaultPublicTenants();

    await this.ssoUsersService.createAdmin();
  }
}
