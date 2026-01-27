import { StatusResponse } from '@nestjs-mod/swagger';
import { ValidationError } from '@nestjs-mod/validation';
import { Body, Controller, Get, Logger, Param, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';

import { AllowEmptySsoUser } from '@site15/sso';
import { AppEnvironments } from '../app.environments';
import { MetricsDynamicService } from '../services/metrics-dynamic.service';
import {
  ChatListMessagesResponse,
  ChatMessageDto,
  ChatSendMessageDto,
  LandingAllStatsResponse,
  LandingSendMessageDto,
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
    if (!this.appEnvironments.landingBotToken || !this.appEnvironments.landingChatId) {
      this.logger.error('Landing bot token or chat ID is not set');
      throw new UnauthorizedException('Bot configuration is incomplete');
    }
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
    const flowControllerUrl = this.appEnvironments.flowControllerUrl;
    const apiKey = this.appEnvironments.flowControllerApiKey;

    // Check if API key is configured
    if (!apiKey) {
      this.logger.warn('Flow Controller API key not configured, using fallback responses');
      return this.getFallbackResponse(args);
    }

    try {
      // Send message to Flow Controller with API key authentication
      const url = `${flowControllerUrl}/flow/message/send`;
      this.logger.debug(
        `Sending message to Flow Controller with API key authentication ${url}, options: ${JSON.stringify({
          message: args.message,
          ...(args.sessionId ? { dialogId: args.sessionId } : {}), // Using sessionId as dialogId
        })}`,
      );
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          message: args.message,
          ...(args.sessionId ? { dialogId: args.sessionId } : {}), // Using sessionId as dialogId
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        this.logger.error(`Flow Controller error: ${response.status} - ${response.statusText}`);
        return { ...this.getFallbackResponse(args), message: result.response, sessionId: result.dialogId };
      }

      // Return the bot's response
      const botMessage: ChatMessageDto = {
        id: result.messageId || this.generateMessageId(),
        sessionId: result.dialogId,
        message: result.answer,
        sender: 'bot',
        timestamp: result.answerSentAt ? new Date(result.answerSentAt) : null,
        name: 'Site Assistant',
        isProcessing: true,
        isError: false,
      };

      return botMessage;
    } catch (error) {
      this.logger.debug({ flowControllerResponse: { ...error } });
      this.logger.error('Error communicating with Flow Controller:', error);
      return this.getFallbackResponse(args);
    }
  }

  @Get('chat/list-messages/:sessionId')
  @ApiOkResponse({ type: ChatListMessagesResponse })
  async chatListMessages(@Param('sessionId') sessionId: string): Promise<ChatListMessagesResponse> {
    const flowControllerUrl = this.appEnvironments.flowControllerUrl;
    const apiKey = this.appEnvironments.flowControllerApiKey;

    // Check if API key is configured
    if (!apiKey) {
      this.logger.warn('Flow Controller API key not configured, returning empty message list');
      return {
        messages: [],
      };
    }

    try {
      // Get dialog messages from Flow Controller with API key authentication
      const params = new URLSearchParams({
        dialogId: sessionId,
        curPage: '1',
        perPage: '50', // Get recent messages
      });

      const response = await fetch(`${flowControllerUrl}/flow/dialog?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      });

      const result = await response.json();
      if (!response.ok) {
        this.logger.debug({ flowControllerResponse: result });
        this.logger.error(`Flow Controller error: ${response.status} - ${response.statusText}`);
        return {
          messages: [],
        };
      }

      // Convert Flow Controller format to our format
      // Each dialog item contains both user question and bot answer
      const messages: ChatMessageDto[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.items.forEach((item: any) => {
        // Add user message
        messages.push({
          id: `user_${item.id}`,
          sessionId: sessionId,
          message: item.question,
          sender: 'user',
          timestamp: item.questionReceivedAt ? new Date(item.questionReceivedAt) : null,
          name: 'User',
          isProcessing: false,
          isError: false,
        });

        // Add bot response
        messages.push({
          id: `bot_${item.id}`,
          sessionId: sessionId,
          message: item.answer,
          sender: 'bot',
          timestamp: item.answerSentAt ? new Date(item.answerSentAt) : null,
          name: 'Site Assistant',
          isProcessing: item.isProcessing,
          isError: false,
          info: item.info,
        });
      });

      return { messages };
    } catch (error) {
      this.logger.error('Error fetching dialog from Flow Controller:', error);
      return {
        messages: [],
      };
    }
  }

  private generateMessageId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private getFallbackResponse(args: ChatSendMessageDto): ChatMessageDto {
    const botGreetings = [
      'Извините, но чат временно недоступен. 🙏',
      'К сожалению, функция чата сейчас не работает. Попробуйте позже.',
      'Чат временно отключен. Мы работаем над исправлением.',
      'Извините за неудобства, чат находится на техническом обслуживании.',
      'Функция чата временно недоступна. Скоро всё заработает!',
      'Чат не работает в данный момент. Пожалуйста, попробуйте позже.',
      'К сожалению, чат сейчас недоступен. Мы уже решаем эту проблему.',
    ];

    const randomGreeting = botGreetings[Math.floor(Math.random() * botGreetings.length)];

    return {
      id: this.generateMessageId(),
      sessionId: args.sessionId || '',
      message: randomGreeting,
      sender: 'bot',
      timestamp: new Date(),
      name: 'Site Assistant',
      isProcessing: false,
      isError: true,
    };
  }
}
