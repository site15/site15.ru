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
  SkipValidateRefreshSession,
  SsoCheckHaveClientSecret,
  SsoCheckIsAdmin,
} from './sso.decorators';
import { SsoStaticEnvironments } from './sso.environments';
import { SsoError, SsoErrorEnum } from './sso.errors';
import { SsoRequest } from './types/sso-request';
import { searchIn } from '@nestjs-mod-sso/common';

@Injectable()
export class SsoGuard implements CanActivate {
  private readonly logger = new Logger(SsoGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly ssoCacheService: SsoCacheService,
    private readonly ssoTokensService: SsoTokensService,
    private readonly ssoProjectService: SsoProjectService,
    private readonly ssoAdminService: SsoAdminService,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const {
      allowEmptyUserMetadata,
      checkSsoIsAdmin,
      checkHaveClientSecret,
      skipValidateRefreshSession,
    } = this.getHandlersReflectMetadata(context);

    const req = this.getRequestFromExecutionContext(context);

    if (allowEmptyUserMetadata) {
      req.skipEmptySsoUser = true;
    }

    const validate = async () => {
      await this.ssoProjectService.getProjectByRequest(req);

      req.ssoAccessTokenData = await this.verifyAndDecodeAccessToken(req);

      if (!skipValidateRefreshSession && req.ssoAccessTokenData?.refreshToken) {
        const refreshSession =
          await this.ssoCacheService.getCachedRefreshSession(
            req.ssoAccessTokenData?.refreshToken
          );

        if (!refreshSession?.enabled) {
          throw new SsoError(SsoErrorEnum.YourSessionHasBeenBlocked);
        }

        this.ssoTokensService.verifyRefreshSession({
          oldRefreshSession: refreshSession,
        });
      }

      req.ssoUser = req.ssoAccessTokenData?.userId
        ? await this.ssoCacheService.getCachedUser({
            userId: req.ssoAccessTokenData?.userId,
          })
        : undefined;

      this.checkRevokedAtOfUser(req);

      req.ssoIsAdmin = this.ssoAdminService.checkAdminInRequest(req);

      if (checkSsoIsAdmin) {
        if (
          !req.ssoIsAdmin &&
          !searchIn(
            req.ssoUser?.roles,
            this.ssoStaticEnvironments.adminDefaultRoles
          )
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
      const result = await validate();

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

  private async verifyAndDecodeAccessToken(req: SsoRequest) {
    return await this.ssoTokensService.verifyAndDecodeAccessToken(
      req.headers['authorization']?.split(' ')?.[1]
    );
  }

  private checkRevokedAtOfUser(req: SsoRequest) {
    if (req.ssoUser && req.ssoUser.revokedAt) {
      const nowTime = new Date();
      if (+nowTime > +new Date(req.ssoUser.revokedAt)) {
        this.logger.debug({
          checkRevokedAtOfUser: {
            revokedAt: req.ssoUser.revokedAt,
            nowTime,
          },
        });
        throw new SsoError(SsoErrorEnum.YourSessionHasBeenBlocked);
      }
    }
  }

  private getRequestFromExecutionContext(context: ExecutionContext) {
    const req = getRequestFromExecutionContext(context) as SsoRequest;
    req.headers = req.headers || {};
    return req;
  }

  private getHandlersReflectMetadata(context: ExecutionContext) {
    const skipValidateRefreshSession = Boolean(
      (typeof context.getHandler === 'function' &&
        this.reflector.get(SkipValidateRefreshSession, context.getHandler())) ||
        (typeof context.getClass === 'function' &&
          this.reflector.get(SkipValidateRefreshSession, context.getClass())) ||
        undefined
    );

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
      skipValidateRefreshSession,
    };
  }
}
