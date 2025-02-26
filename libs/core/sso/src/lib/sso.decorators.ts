import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SsoRequest } from './types/sso-request';

export const SsoCheckIsAdmin = Reflector.createDecorator<true>();
export const SsoCheckHaveClientSecret = Reflector.createDecorator<true>();

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
