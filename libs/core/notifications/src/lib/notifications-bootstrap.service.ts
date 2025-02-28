import { isInfrastructureMode } from '@nestjs-mod/common';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsServiceBootstrap implements OnApplicationBootstrap {
  constructor(private readonly notificationsService: NotificationsService) {}

  async onApplicationBootstrap() {
    if (isInfrastructureMode()) {
      return;
    }

    await this.notificationsService.sendAllNewEvents();
  }
}
