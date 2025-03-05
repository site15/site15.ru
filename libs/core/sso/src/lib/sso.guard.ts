import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SsoAdminService } from './services/sso-admin.service';
import { SsoCacheService } from './services/sso-cache.service';
import { SsoProjectService } from './services/sso-project.service';
import { SsoTokensService } from './services/sso-tokens.service';
import {
  AllowEmptySsoUser,
  SsoCheckHaveClientSecret,
  SsoCheckIsAdmin,
} from './sso.decorators';
import { SsoError, SsoErrorEnum } from './sso.errors';
import { SsoRequest } from './types/sso-request';
import { SsoRole } from './types/sso-role';

@Injectable()
export class SsoGuard implements CanActivate {
  private readonly logger = new Logger(SsoGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly ssoCacheService: SsoCacheService,
    private readonly ssoTokensService: SsoTokensService,
    private readonly ssoProjectService: SsoProjectService,
    private readonly ssoAdminService: SsoAdminService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { allowEmptyUserMetadata, checkSsoIsAdmin, checkHaveClientSecret } =
      this.getHandlersReflectMetadata(context);

    const req = this.getRequestFromExecutionContext(context);

    if (allowEmptyUserMetadata) {
      req.skipEmptySsoUser = true;
    }

    const func = async () => {
      await this.ssoProjectService.getProjectByRequest(req);

      req.ssoAccessTokenData =
        await this.ssoTokensService.verifyAndDecodeAccessToken(
          req.headers['authorization']?.split(' ')?.[1]
        );

      req.ssoUser = req.ssoAccessTokenData?.userId
        ? await this.ssoCacheService.getCachedUser({
            userId: req.ssoAccessTokenData?.userId,
            projectId: req.ssoProject.id,
          })
        : undefined;

      if (req.ssoUser && req.ssoUser.revokedAt) {
        throw new SsoError(SsoErrorEnum.YouAreBlocked);
      }

      req.ssoIsAdmin = this.ssoAdminService.checkAdminInRequest(req);

      if (checkSsoIsAdmin) {
        if (
          !req.ssoIsAdmin &&
          !req.ssoUser?.roles?.split(',').includes(SsoRole.admin)
        ) {
          throw new SsoError(SsoErrorEnum.Forbidden);
        }
        return true;
      }

      if (checkHaveClientSecret && !req.ssoClientSecret) {
        throw new SsoError(SsoErrorEnum.Forbidden);
      }

      if (!req.ssoUser && !req.skipEmptySsoUser) {
        throw new SsoError(SsoErrorEnum.Forbidden);
      }

      return true;
    };
    try {
      const result = await func();

      this.logger.debug(
        `${context.getClass().name}.${
          context.getHandler().name
        }: ${result}, ssoProject: ${JSON.stringify(
          req.ssoProject
        )}, ssoClientId: ${
          req.ssoClientId
        }, ssoAccessTokenData: ${JSON.stringify(
          req.ssoAccessTokenData
        )}, ssoUser: ${JSON.stringify(req.ssoUser)}, ssoIsAdmin: ${
          req.ssoIsAdmin
        }`
      );

      if (!result) {
        throw new SsoError(SsoErrorEnum.Forbidden);
      }

      return result;
    } catch (err) {
      this.logger.debug(
        `${context.getClass().name}.${context.getHandler().name}: ${String(
          err
        )}, ssoProject: ${JSON.stringify(req.ssoProject)}, ssoClientId: ${
          req.ssoClientId
        }, ssoAccessTokenData: ${JSON.stringify(
          req.ssoAccessTokenData
        )}, ssoUser: ${JSON.stringify(req.ssoUser)}, ssoIsAdmin: ${
          req.ssoIsAdmin
        }`
      );
      throw err;
    }
  }

  private getRequestFromExecutionContext(context: ExecutionContext) {
    const req = getRequestFromExecutionContext(context) as SsoRequest;
    req.headers = req.headers || {};
    return req;
  }

  private getHandlersReflectMetadata(context: ExecutionContext) {
    const allowEmptyUserMetadata = Boolean(
      (typeof context.getHandler === 'function' &&
        this.reflector.get(AllowEmptySsoUser, context.getHandler())) ||
        (typeof context.getClass === 'function' &&
          this.reflector.get(AllowEmptySsoUser, context.getClass())) ||
        undefined
    );

    const checkSsoIsAdmin =
      (typeof context.getHandler === 'function' &&
        this.reflector.get(SsoCheckIsAdmin, context.getHandler())) ||
      (typeof context.getClass === 'function' &&
        this.reflector.get(SsoCheckIsAdmin, context.getClass())) ||
      undefined;

    const checkHaveClientSecret =
      (typeof context.getHandler === 'function' &&
        this.reflector.get(SsoCheckHaveClientSecret, context.getHandler())) ||
      (typeof context.getClass === 'function' &&
        this.reflector.get(SsoCheckHaveClientSecret, context.getClass())) ||
      undefined;

    return {
      allowEmptyUserMetadata,
      checkSsoIsAdmin,
      checkHaveClientSecret,
    };
  }
}
