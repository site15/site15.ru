import { StatusResponse } from '@nestjs-mod/swagger';
import { ValidationError } from '@nestjs-mod/validation';
import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiPropertyOptional, ApiTags, refs } from '@nestjs/swagger';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';

import { ApiProperty } from '@nestjs/swagger';
import { AllowEmptySsoUser } from '@site15/sso';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AppEnvironments } from '../app.environments';

export class LandingAllStatsResponse {
  @ApiProperty({
    type: () => Object,
  })
  allStats!: object;
}

export class LandingSendMessageDto {
  @ApiPropertyOptional({
    type: 'string',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  email!: string;

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  message!: string;
}

@ApiBadRequestResponse({
  schema: { allOf: refs(ValidationError) },
})
@ApiTags('Landing')
@Controller('/landing')
@AllowEmptySsoUser()
export class LandingController {
  private readonly logger = new Logger(LandingController.name);

  constructor(private readonly appEnvironments: AppEnvironments) {}

  @Get('stats')
  @ApiOkResponse({ type: LandingAllStatsResponse })
  async stats() {
    /**
     * Data loader module that provides all statistics data as a promise
     */

    // Define all stats constants
    const githubStats = {
      rucken: {
        stars: 508,
        commits: 2814,
      },
      user: {
        followers: 97,
        repos: 88,
        totalStars: 431,
      },
      org: {
        repos: 9,
        totalStars: 35,
      },
      commitDuration: '2 года 11 месяцев 26 дней',
    };

    // KaufmanBot statistics (updated by Node.js script)
    const kaufmanbotStats = {
      stars: 26,
      commits: 465,
      duration: '7 месяцев 14 дней',
    };

    // NestJS-mod statistics (updated by Node.js script)
    const nestjsmodStats = {
      stars: 33,
      commits: 2405,
      duration: '1 год 7 месяцев 15 дней',
    };

    // ngx-dynamic-form-builder statistics (updated by Node.js script)
    const ngxDynamicFormBuilderStats = {
      stars: 117,
      commits: 343,
      duration: '2 года 9 месяцев 13 дней',
    };

    // nest-permissions-seed statistics (updated by Node.js script)
    const nestPermissionsSeedStats = {
      stars: 174,
      commits: 29,
      duration: '1 месяц 12 дней',
    };

    // typegraphql-prisma-nestjs statistics (updated by Node.js script)
    const typeGraphqlPrismaNestjsStats = {
      stars: 29,
      commits: 100,
      duration: '4 года 6 месяцев 15 дней',
    };

    // class-validator-multi-lang statistics (updated by Node.js script)
    const classValidatorMultiLangStats = {
      stars: 15,
      commits: 807,
      duration: '5 лет 3 месяца 26 дней',
    };

    // Habr statistics (updated by Node.js script)
    const habrStats = {
      articles: 28,
      followers: 18,
      karma: 1,
    };

    return {
      githubStats,
      kaufmanbotStats,
      nestjsmodStats,
      ngxDynamicFormBuilderStats,
      nestPermissionsSeedStats,
      typeGraphqlPrismaNestjsStats,
      classValidatorMultiLangStats,
      habrStats,
    };
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
