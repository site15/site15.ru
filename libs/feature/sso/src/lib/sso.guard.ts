import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { searchIn, splitIn } from '@nestjs-mod/misc';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCEPT_LANGUAGE, TranslatesStorage } from 'nestjs-translates';
import { SsoUser } from './generated/rest/dto/sso-user.entity';
import { SsoCacheService } from './services/sso-cache.service';
import { SsoProjectService } from './services/sso-project.service';
import { SsoTokensService } from './services/sso-tokens.service';
import { SsoConfiguration } from './sso.configuration';
import { X_SKIP_THROTTLE } from './sso.constants';
import {
  AllowEmptySsoUser,
  CheckHaveSsoClientSecret,
  CheckSsoRole,
  SkipSsoGuard,
  SkipValidateRefreshSession,
} from './sso.decorators';
import { SsoStaticEnvironments } from './sso.environments';
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
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly ssoConfiguration: SsoConfiguration,
    private readonly translatesStorage: TranslatesStorage,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { allowEmptyUserMetadata, skipValidateRefreshSession, checkHaveSsoClientSecret, checkSsoRole, skipSsoGuard } =
      this.getHandlersReflectMetadata(context);

    const req = this.getRequestFromExecutionContext(context);

    const validate = async () => {
      if (allowEmptyUserMetadata) {
        req.skipEmptySsoUser = true;
      }

      if (req.headers[X_SKIP_THROTTLE] && req.headers[X_SKIP_THROTTLE] === this.ssoStaticEnvironments.adminSecret) {
        req.skipThrottle = true;
      }

      if (skipSsoGuard) {
        return true;
      }

      // detect project
      if (checkHaveSsoClientSecret && !req.ssoClientSecret) {
        throw new SsoError(SsoErrorEnum.Forbidden);
      }
      req.ssoProject = await this.ssoProjectService.getProjectByRequest(req);

      // process jwt token
      req.ssoAccessTokenData = await this.ssoTokensService.verifyAndDecodeAccessToken(
        req.headers['authorization']?.split(' ')?.[1],
      );
      if (!skipValidateRefreshSession && req.ssoAccessTokenData?.refreshToken) {
        const refreshSession = await this.ssoCacheService.getCachedRefreshSession(req.ssoAccessTokenData?.refreshToken);
        if (!refreshSession?.enabled) {
          throw new SsoError(SsoErrorEnum.YourSessionHasBeenBlocked);
        }
        this.ssoTokensService.verifyRefreshSession({
          oldRefreshSession: refreshSession,
        });
      }

      // get user
      req.ssoUser = req.ssoAccessTokenData?.userId
        ? await this.ssoCacheService.getCachedUser({
            userId: req.ssoAccessTokenData?.userId,
          })
        : undefined;

      // check user as revoke
      if (req.ssoUser?.id && req.ssoUser.revokedAt) {
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

      // set admin roles
      if (this.ssoConfiguration.adminSecretHeaderName && req.headers?.[this.ssoConfiguration.adminSecretHeaderName]) {
        if (req.headers?.[this.ssoConfiguration.adminSecretHeaderName] !== this.ssoStaticEnvironments.adminSecret) {
          throw new SsoError(SsoErrorEnum.Forbidden);
        }
        if (!req.ssoUser) {
          req.ssoUser = {} as SsoUser;
        }
        req.ssoUser.roles = SsoRole.admin;
      }
      if (
        req.ssoUser &&
        this.ssoStaticEnvironments.adminEmail &&
        req.ssoUser?.email === this.ssoStaticEnvironments.adminEmail
      ) {
        req.ssoUser.roles = SsoRole.admin;
      }
      if (
        req.ssoUser &&
        this.ssoStaticEnvironments.adminDefaultRoles &&
        searchIn(this.ssoStaticEnvironments.adminDefaultRoles, req.ssoUser.roles)
      ) {
        req.ssoUser.roles = [...new Set([...splitIn(req.ssoUser.roles), SsoRole.admin])].join(',');
      }

      // set manager roles
      if (
        req.ssoUser &&
        this.ssoStaticEnvironments.adminDefaultRoles &&
        searchIn(this.ssoStaticEnvironments.managerDefaultRoles, req.ssoUser.roles)
      ) {
        req.ssoUser.roles = [...new Set([...splitIn(req.ssoUser.roles), SsoRole.manager])].join(',');
      }

      // check roles by handler roles
      if (checkSsoRole && req.ssoUser?.id && !searchIn(req.ssoUser.roles, checkSsoRole)) {
        throw new SsoError(SsoErrorEnum.Forbidden);
      }

      // current lang
      if (req.ssoUser?.lang) {
        req.headers[ACCEPT_LANGUAGE] = req.ssoUser.lang;
      }

      if (
        !req.headers[ACCEPT_LANGUAGE] ||
        (req.headers[ACCEPT_LANGUAGE] && !this.translatesStorage.locales.includes(req.headers[ACCEPT_LANGUAGE]))
      ) {
        req.headers[ACCEPT_LANGUAGE] = this.translatesStorage.defaultLocale;
      }

      // check access by custom logic
      if (this.ssoConfiguration.checkAccessValidator) {
        await this.ssoConfiguration.checkAccessValidator(req.ssoUser, context);
      }

      // throw error if user is empty
      if (!req.ssoUser && !req.skipEmptySsoUser) {
        throw new SsoError(SsoErrorEnum.Forbidden);
      }

      return true;
    };

    try {
      this.log({ context, req, skipSsoGuard, checkSsoRole });

      const result = await validate();

      this.log({ context, result, req, skipSsoGuard, checkSsoRole });

      if (!result) {
        throw new SsoError(SsoErrorEnum.Forbidden);
      }

      return result;
    } catch (err) {
      this.log({
        context,
        error: err,
        req,
        skipSsoGuard,
        checkSsoRole,
      });
      throw err;
    }
  }

  private log({
    context,
    result,
    error,
    req,
    skipSsoGuard,
    checkSsoRole,
  }: {
    context: ExecutionContext;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error?: any;
    req: SsoRequest;
    skipSsoGuard: boolean;
    checkSsoRole: SsoRole[] | undefined;
  }) {
    const message = `${context.getClass().name}.${context.getHandler().name}${
      error ? `: ${String(error)}` : result ? `: ${result}` : ''
    }, projectId: ${JSON.stringify(req.ssoProject?.id)}, clientId: ${JSON.stringify(
      req.ssoClientId,
    )}, accessTokenData: ${JSON.stringify(
      req.ssoAccessTokenData,
    )}, userId: ${JSON.stringify(req.ssoUser?.id)}, userRoles: ${JSON.stringify(
      req.ssoUser?.roles,
    )}, skipGuard: ${JSON.stringify(skipSsoGuard)}, checkRole: ${JSON.stringify(
      checkSsoRole,
    )}, language: ${JSON.stringify(req.headers[ACCEPT_LANGUAGE])}`;
    if (error) {
      this.logger.error(message);
    } else {
      this.logger.debug(message);
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
        this.reflector.get(SkipValidateRefreshSession, context.getHandler()) === true) ||
        (typeof context.getClass === 'function' &&
          this.reflector.get(SkipValidateRefreshSession, context.getClass()) === true) ||
        undefined,
    );

    const allowEmptyUserMetadata = Boolean(
      (typeof context.getHandler === 'function' && this.reflector.get(AllowEmptySsoUser, context.getHandler())) ||
        (typeof context.getClass === 'function' && this.reflector.get(AllowEmptySsoUser, context.getClass())) ||
        undefined,
    );

    const checkHaveSsoClientSecret = Boolean(
      (typeof context.getHandler === 'function' &&
        this.reflector.get(CheckHaveSsoClientSecret, context.getHandler())) ||
        (typeof context.getClass === 'function' && this.reflector.get(CheckHaveSsoClientSecret, context.getClass())) ||
        undefined,
    );

    const skipSsoGuard = Boolean(
      (typeof context.getHandler === 'function' && this.reflector.get(SkipSsoGuard, context.getHandler())) ||
        (typeof context.getClass === 'function' && this.reflector.get(SkipSsoGuard, context.getClass())) ||
        undefined,
    );

    const checkSsoRole =
      (typeof context.getHandler === 'function' && this.reflector.get(CheckSsoRole, context.getHandler())) ||
      (typeof context.getClass === 'function' && this.reflector.get(CheckSsoRole, context.getClass())) ||
      undefined;

    return {
      allowEmptyUserMetadata,
      checkHaveSsoClientSecret,
      skipValidateRefreshSession,
      skipSsoGuard,
      checkSsoRole,
    };
  }
}
