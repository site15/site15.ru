import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/notifications-client';

export class NotificationsEntities {
  @ApiProperty({
    enum: Prisma.NotificationsEventScalarFieldEnum,
    enumName: 'NotificationsEventScalarFieldEnum',
  })
  notificationEvent!: Prisma.NotificationsEventScalarFieldEnum;
}
