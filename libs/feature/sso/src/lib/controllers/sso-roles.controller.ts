import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SsoStaticEnvironments } from '../sso.environments';
import { FindManySsoRoleResponse } from '../types/find-many-sso-role-response';

@ApiTags('Sso')
@Controller('/sso/roles')
export class SsoRolesController {
  constructor(private readonly ssoStaticEnvironments: SsoStaticEnvironments) {}

  @Get()
  @ApiOkResponse({ type: FindManySsoRoleResponse })
  async findMany() {
    return {
      adminDefaultRoles: this.ssoStaticEnvironments.adminDefaultRoles,
      userAvailableRoles: this.ssoStaticEnvironments.userAvailableRoles,
      userDefaultRoles: this.ssoStaticEnvironments.userDefaultRoles,
    } as FindManySsoRoleResponse;
  }
}
