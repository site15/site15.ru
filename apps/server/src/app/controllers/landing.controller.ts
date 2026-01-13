import { StatusResponse } from '@nestjs-mod/swagger';
import { ValidationError } from '@nestjs-mod/validation';
import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';

import { AllowEmptySsoUser } from '@site15/sso';
import { AppEnvironments } from '../app.environments';
import { MetricsDynamicService } from '../services/metrics-dynamic.service';
import {
  LandingAllStatsResponse,
  LandingSendMessageDto,
  ChatSendMessageDto,
  ChatListMessagesResponse,
  ChatMessageDto,
} from '../services/type';

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
        text: `<u>Сообщение с site15.ru</u>
<b>Дата:</b> <i>${new Date().toLocaleString()}</i>
<b>Имя:</b> <i>${args.name}</i>
<b>E-mail/Телеграм:</b> <i>${contact}</i>
<b>Сообщение:</b> <i>${args.message}</i>`,
        parse_mode: 'HTML', // можно MarkdownV2
      }),
    });

    const result = await response.json();
    this.logger.debug({ sendMessageResult: result });
    return { message: getText('ok') };
  }

  @Post('chat/send-message')
  @ApiOkResponse({ type: ChatMessageDto })
  async chatSendMessage(@Body() args: ChatSendMessageDto): Promise<ChatMessageDto> {
    // Store user message
    const userMessage: ChatMessageDto = {
      id: this.generateMessageId(),
      sessionId: args.sessionId,
      message: args.message,
      sender: 'user',
      timestamp: new Date(),
      name: args.name,
    };

    // Store in memory (in production, use database)
    this.storeMessage(userMessage);

    // Generate random bot response
    const botGreetings = [
      'Привет! Рад вас видеть! 👋',
      'Здравствуйте! Как я могу вам помочь?',
      'Добрый день! Чем могу быть полезен?',
      'Приветствуем! Готов ответить на ваши вопросы.',
      'Хай! Расскажите, что вам нужно?',
      'Здравствуйте! Помогу разобраться с сайтом.',
      'Привет! Спасибо за обращение!',
      'Доброго времени суток! Что интересует?',
    ];

    const randomGreeting = botGreetings[Math.floor(Math.random() * botGreetings.length)];

    // Create bot response
    const botMessage: ChatMessageDto = {
      id: this.generateMessageId(),
      sessionId: args.sessionId,
      message: randomGreeting,
      sender: 'bot',
      timestamp: new Date(Date.now() + 1000), // Slight delay for realism
      name: 'Site Assistant',
    };

    // Store bot message
    this.storeMessage(botMessage);

    return botMessage;
  }

  @Get('chat/list-messages/:sessionId')
  @ApiOkResponse({ type: ChatListMessagesResponse })
  async chatListMessages(@Param('sessionId') sessionId: string): Promise<ChatListMessagesResponse> {
    const messages = this.getStoredMessages(sessionId);
    return { messages };
  }

  // Helper methods for in-memory storage (replace with database in production)
  private storedMessages: Map<string, ChatMessageDto[]> = new Map();

  private generateMessageId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private storeMessage(message: ChatMessageDto): void {
    if (!this.storedMessages.has(message.sessionId)) {
      this.storedMessages.set(message.sessionId, []);
    }
    this.storedMessages.get(message.sessionId)!.push(message);
    this.logger.debug(`Stored message for session ${message.sessionId}: ${message.message}`);
  }

  private getStoredMessages(sessionId: string): ChatMessageDto[] {
    return this.storedMessages.get(sessionId) || [];
  }
}
