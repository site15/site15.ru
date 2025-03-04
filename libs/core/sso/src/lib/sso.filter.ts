import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { SsoError, SsoErrorEnum } from './sso.errors';

@Catch(SsoError)
export class SsoExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(SsoExceptionsFilter.name);

  override catch(exception: SsoError, host: ArgumentsHost) {
    if (exception instanceof SsoError) {
      this.logger.error(exception, exception.stack);
      super.catch(
        new HttpException(
          {
            code: exception.code,
            message: exception.message,
            metadata: exception.metadata,
          },
          exception.code === SsoErrorEnum.AccessTokenExpired
            ? HttpStatus.UNAUTHORIZED
            : HttpStatus.BAD_REQUEST
        ),
        host
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.logger.error(exception, (exception as any)?.stack);
      super.catch(exception, host);
    }
  }
}
