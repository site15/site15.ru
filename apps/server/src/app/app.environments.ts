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

  @EnvModelProperty({
    description:
      'Dev.to API Key - replace with your actual API key from https://dev.to/settings/account, You can generate a new API key at: https://dev.to/settings/extensions',
    hideValueFromOutputs: true,
  })
  @IsNotEmpty()
  devtoApiKey!: string;

  @EnvModelProperty({
    description:
      'GitHub Personal Access Token - replace with your actual token, You can generate a new token at: https://github.com/settings/tokens, Make sure to select appropriate scopes for accessing public_repo data',
    hideValueFromOutputs: true,
  })
  @IsNotEmpty()
  githubToken!: string;
}
