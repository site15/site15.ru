import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';

@ConfigModel()
export class TwoFactorConfiguration {
  @ConfigModelProperty({
    description: 'Two factorpipe options',
  })
  pipeOptions?: any;
}
