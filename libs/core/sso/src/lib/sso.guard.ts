import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SsoCacheService } from './services/sso-cache.service';
import { SsoTokensService } from './services/sso-tokens.service';
import { SsoStaticConfiguration } from './sso.configuration';
import { SsoCheckHaveClientSecret, SsoCheckIsAdmin } from './sso.decorators';
import { SsoStaticEnvironments } from './sso.environments';
import { SsoError, SsoErrorEnum } from './sso.errors';
import { SsoRequest } from './types/sso-request';

@Injectable()
export class SsoGuard implements CanActivate {
  private readonly logger = new Logger(SsoGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly ssoStaticConfiguration: SsoStaticConfiguration,
    private readonly ssoCacheService: SsoCacheService,
    private readonly ssoTokensService: SsoTokensService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { checkSsoIsAdmin, checkHaveClientSecret } =
      this.getHandlersReflectMetadata(context);

    const req = this.getRequestFromExecutionContext(context);

    const func = async () => {
      req.ssoClientId = this.getClientIdFromRequest(req);
      req.ssoClientSecret = this.getClientSecretFromRequest(req);
      req.ssoIsAdmin = this.checkAdminInRequest(req);

      if (req.ssoClientId) {
        const project = await this.ssoCacheService.getCachedProject(
          req.ssoClientId
        );
        if (project) {
          req.ssoProject = project;
        }
      }

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

      if (checkSsoIsAdmin && !req.ssoIsAdmin) {
        throw new SsoError(SsoErrorEnum.Forbidden);
      }

      if (checkHaveClientSecret && !req.ssoClientSecret) {
        throw new SsoError(SsoErrorEnum.Forbidden);
      }

      return true;
    };

    const result = await func();

    this.logger.debug(
      `${context.getClass().name}.${
        context.getHandler().name
      }: ${result}, ssoProject: ${JSON.stringify(
        req.ssoProject
      )}, ssoClientId: ${req.ssoClientId}, ssoAccessTokenData: ${JSON.stringify(
        req.ssoAccessTokenData
      )}, ssoUser: ${JSON.stringify(req.ssoUser)}`
    );

    if (!result) {
      throw new SsoError(SsoErrorEnum.Forbidden);
    }
    return result;
  }

  private checkAdminInRequest(req: SsoRequest) {
    if (
      this.ssoStaticConfiguration.adminSecretHeaderName &&
      req.headers?.[this.ssoStaticConfiguration.adminSecretHeaderName]
    ) {
      return (
        req.headers?.[this.ssoStaticConfiguration.adminSecretHeaderName] ===
        this.ssoStaticEnvironments.adminSecret
      );
    }

    return undefined;
  }

  private getClientSecretFromRequest(req: SsoRequest) {
    return (
      req.ssoClientSecret ||
      (this.ssoStaticConfiguration.clientSecretHeaderName &&
        req.headers?.[this.ssoStaticConfiguration.clientSecretHeaderName])
    );
  }

  private getClientIdFromRequest(req: SsoRequest) {
    return (
      req.ssoClientId ||
      (this.ssoStaticConfiguration.clientIdHeaderName &&
        req.headers?.[this.ssoStaticConfiguration.clientIdHeaderName])
    );
  }

  private getRequestFromExecutionContext(context: ExecutionContext) {
    const req = getRequestFromExecutionContext(context) as SsoRequest;
    req.headers = req.headers || {};
    return req;
  }

  private getHandlersReflectMetadata(context: ExecutionContext) {
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
      checkSsoIsAdmin,
      checkHaveClientSecret,
    };
  }
}
