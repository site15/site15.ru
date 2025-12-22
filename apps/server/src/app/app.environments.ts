import { EnvModel, EnvModelProperty } from '@nestjs-mod/common';
import { IsNotEmpty } from 'class-validator';

@EnvModel()
export class AppEnvironments {
  @EnvModelProperty({
    description: 'Landing bot token',
    hideValueFromOutputs: true,
  })
  @IsNotEmpty()
  landingBotToken!: string;

  @EnvModelProperty({
    description: 'Landing chat ID',
  })
  @IsNotEmpty()
  landingChatId!: string;
}
