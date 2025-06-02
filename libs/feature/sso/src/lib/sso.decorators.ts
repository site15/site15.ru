import {
  getRequestFromExecutionContext,
  prepareHeaders,
} from '@nestjs-mod/common';
import {
  applyDecorators,
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SsoTimezoneInterceptor } from './interceptors/sso-timezone.interceptor';
import { SsoGuard } from './sso.guard';
import { SsoRequest } from './types/sso-request';
import { SsoRole } from './types/sso-role';

export const SkipValidateRefreshSession = Reflector.createDecorator();
export const AllowEmptySsoUser = Reflector.createDecorator();
export const CheckHaveSsoClientSecret = Reflector.createDecorator<true>();
export const SkipSsoGuard = Reflector.createDecorator<true>();
export const CheckSsoRole = Reflector.createDecorator<SsoRole[]>();

export const CurrentSsoRequest = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = getRequestFromExecutionContext(ctx) as SsoRequest;
    return req;
  }
);

export const CurrentSsoUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = getRequestFromExecutionContext(ctx) as SsoRequest;
    return req.ssoUser;
  }
);

function AddHandleConnection() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (constructor: Function) {
    if (constructor.prototype) {
      constructor.prototype.handleConnection = function (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client: any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any[]
      ) {
        const url = args[0]?.url
          ? new URL(`http://localhost${args[0]?.url}`)
          : null;

        const queryToken = url?.searchParams.get('token');
        const queryClientId = url?.searchParams.get('clientId');

        const headers = prepareHeaders(args[0]?.headers);

        const authorizationHeader = headers.authorization;
        const xClientIdHeader = headers['x-client-id'];

        client.headers = {
          ...(authorizationHeader || queryToken
            ? {
                authorization: authorizationHeader
                  ? authorizationHeader
                  : queryToken
                  ? `Bearer ${queryToken}`
                  : '',
              }
            : {}),
          ...(xClientIdHeader
            ? {
                'x-client-id': xClientIdHeader || queryClientId,
              }
            : {}),
        };
      };
    }
  };
}

export function UseSsoInterceptorsAndGuards(options?: {
  // eslint-disable-next-line @typescript-eslint/ban-types
  guards?: (CanActivate | Function)[];
  skipInterceptor?: boolean;
}) {
  return applyDecorators(
    ...[
      ...(options?.skipInterceptor
        ? []
        : [UseInterceptors(SsoTimezoneInterceptor)]),
      UseGuards(...(options?.guards || []), SsoGuard),
      AllowEmptySsoUser(),
      AddHandleConnection(),
    ]
  );
}
