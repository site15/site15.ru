import { Controller, Get } from '@nestjs/common';

import { AllowEmptyAuthUser, AuthError } from '@nestjs-mod-sso/auth';
import { ApiExtraModels, ApiOkResponse, ApiProperty } from '@nestjs/swagger';

export class AuthorizerClientID {
  @ApiProperty({ type: String })
  clientID!: string;
}

// @AllowEmptyUser()
@AllowEmptyAuthUser()
@ApiExtraModels(AuthError)
@Controller()
export class AuthorizerController {
  @Get('/authorizer/client-id')
  @ApiOkResponse({ type: AuthorizerClientID })
  getAuthorizerClientID() {
    return { clientID: '' };
  }
}
