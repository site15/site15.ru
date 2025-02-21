import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getClientIp } from '../utils/request-ip';

export const IpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = getRequestFromExecutionContext(ctx);
    return getClientIp(request);
  }
);
