import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserAgent = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  return getRequestFromExecutionContext(ctx).headers['user-agent'];
});
