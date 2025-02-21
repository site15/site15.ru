import { Injectable, Logger } from '@nestjs/common';
import { TranslatesService } from 'nestjs-translates';

@Injectable()
export class SsoMailService {
  private readonly logger = new Logger(SsoMailService.name);

  constructor(private readonly translatesService: TranslatesService) {}

  async sendMail(sendMailOptions: {
    to: string;
    subject: string;
    text?: string;
    html: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: any;
  }) {
    this.logger.debug(
      `sendMail: ${JSON.stringify({
        to: sendMailOptions.to,
        subject: this.translatesService.translate(
          sendMailOptions.subject,
          sendMailOptions.context || {}
        ),
        text: sendMailOptions.text
          ? this.translatesService.translate(
              sendMailOptions.text,
              sendMailOptions.context || {}
            )
          : undefined,
        html: sendMailOptions.html
          ? this.translatesService.translate(
              sendMailOptions.html,
              sendMailOptions.context || {}
            )
          : undefined,
      })}`
    );
    return true;
  }
}
