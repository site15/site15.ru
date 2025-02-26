import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';

@ConfigModel()
export class NotificationsConfiguration {
  @ConfigModelProperty({
    description: 'Notificationspipe options',
  })
  pipeOptions?: any;
}
