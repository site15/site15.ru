import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { MetricsError } from './metrics.errors';

@Catch(MetricsError)
export class MetricsExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(MetricsExceptionsFilter.name);

  override catch(exception: MetricsError, host: ArgumentsHost) {
    if (exception instanceof MetricsError) {
      this.logger.error(exception, exception.stack);
      super.catch(
        new HttpException(
          {
            code: exception.code,
            message: exception.message,
            metadata: exception.metadata,
          },
          HttpStatus.BAD_REQUEST,
        ),
        host,
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.logger.error(exception, (exception as any)?.stack);
      super.catch(exception, host);
    }
  }
}
