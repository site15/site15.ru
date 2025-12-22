import { StatusResponse } from '@nestjs-mod/swagger';
import { ValidationError } from '@nestjs-mod/validation';
import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';

import { AllowEmptySsoUser } from '@site15/sso';
import { AppEnvironments } from '../app.environments';
import { MetricsDynamicService } from '../services/metrics-dynamic.service';
import { LandingAllStatsResponse, LandingSendMessageDto } from '../services/type';

@ApiBadRequestResponse({
  schema: { allOf: refs(ValidationError) },
})
@ApiTags('Landing')
@Controller('/landing')
@AllowEmptySsoUser()
export class LandingController {
  private readonly logger = new Logger(LandingController.name);

  constructor(
    private readonly appEnvironments: AppEnvironments,
    private readonly metricsDynamicService: MetricsDynamicService,
  ) {}

  @Get('stats')
  @ApiOkResponse({ type: LandingAllStatsResponse })
  async stats() {
    return { allStats: await this.metricsDynamicService.getAllSync() };
  }

  @Post('send-message')
  @ApiOkResponse({ type: StatusResponse })
  async sendMessage(@Body() args: LandingSendMessageDto, @InjectTranslateFunction() getText: TranslateFunction) {
    const url = `https://api.telegram.org/bot${this.appEnvironments.landingBotToken}/sendMessage`;
    let contact = args.email;
    if (contact.includes('@') && contact.split('@')[0]) {
      contact = `<pre>${contact}</pre>`;
    } else {
      if (contact.includes('@')) {
        contact = `${contact}`;
      } else {
        contact = `@${contact}`;
      }
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: -1 * +this.appEnvironments.landingChatId,
        text: `<u>Сообщение с site15.ru</u>\n<b>Дата:</b> <i>${new Date().toLocaleString()}</i>\n<b>Имя:</b> <i>${args.name}</i>\n<b>E-mail/Телеграм:</b> <i>${contact}</i>\n<b>Сообщение:</b> <i>${args.message}</i>`,
        parse_mode: 'HTML', // можно MarkdownV2
      }),
    });

    const result = await response.json();
    this.logger.debug({ sendMessageResult: result });
    return { message: getText('ok') };
  }
}
