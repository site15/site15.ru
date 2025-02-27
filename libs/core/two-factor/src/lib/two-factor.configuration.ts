/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';
import { TwoFactorCodeDto } from './generated/rest/dto/two-factor-code.dto';
import { TwoFactorUserDto } from './generated/rest/dto/two-factor-user.dto';

type GetTimeoutValueOptions = {
  twoFactorCode: TwoFactorCodeDto;
  twoFactorUser: TwoFactorUserDto;
};

@ConfigModel()
export class TwoFactorConfiguration {
  @ConfigModelProperty({
    description: 'Function for determining the lifetime of code',
    default: (options: GetTimeoutValueOptions) => 15 * 60 * 1000,
  })
  getTimeoutValue?: (options: GetTimeoutValueOptions) => number;

  @ConfigModelProperty({
    description:
      'Function for determining the maximum number of attempts to enter a code',
    default: (options: GetTimeoutValueOptions) => 3,
  })
  getMaxAttemptValue?: (options: GetTimeoutValueOptions) => number;
}
