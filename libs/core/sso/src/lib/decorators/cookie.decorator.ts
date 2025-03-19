import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = getRequestFromExecutionContext(ctx);
    return data ? request.cookies?.[data] : request.cookies;
  }
);
