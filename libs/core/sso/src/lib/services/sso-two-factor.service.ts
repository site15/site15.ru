import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SsoTwoFactorService {
  private readonly logger = new Logger(SsoTwoFactorService.name);

  async generate(options: { user: { id: string } }) {
    return Buffer.from(options.user.id).toString('hex');
  }

  async validateOnlyTwoFactorCode(code: string) {
    return {
      user: { id: Buffer.from(code, 'hex').toString() },
    };
  }
}
