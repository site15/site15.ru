import { EnvModel, EnvModelProperty } from '@nestjs-mod/common';

@EnvModel()
export class AppEnvironments {
  @EnvModelProperty({
    description: 'Landing bot token',
    hideValueFromOutputs: true,
  })
  landingBotToken?: string;

  @EnvModelProperty({
    description: 'Landing chat ID',
  })
  landingChatId?: string;

  @EnvModelProperty({
    description:
      'Dev.to API Key - replace with your actual API key from https://dev.to/settings/account, You can generate a new API key at: https://dev.to/settings/extensions',
    hideValueFromOutputs: true,
  })
  devtoApiKey?: string;

  @EnvModelProperty({
    description:
      'GitHub Personal Access Token - replace with your actual token, You can generate a new token at: https://github.com/settings/tokens, Make sure to select appropriate scopes for accessing public_repo data',
    hideValueFromOutputs: true,
  })
  githubToken?: string;

  @EnvModelProperty({
    description: 'Sync all stats after start - replace with your actual value',
  })
  syncAllStatsAfterStart?: boolean;

  @EnvModelProperty({
    description: 'Sync all stats by interval - replace with your actual value',
  })
  syncAllStatsByInterval?: boolean;

  @EnvModelProperty({
    description: 'Flow Controller API URL for chat integration',
    default: 'http://locahost:23000/api',
  })
  flowControllerUrl?: string;

  @EnvModelProperty({
    description: 'Flow Controller API Key for authentication',
    hideValueFromOutputs: true,
  })
  flowControllerApiKey?: string;
}
