/**
 *
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { NotificationsEventInterface } from './notifications-event.interface';

export interface NotificationsUserInterface {
  id: string;
  externalTenantId: string;
  externalUserId: string;
  createdAt: string;
  updatedAt: string;
  NotificationsEvent_NotificationsEvent_recipientUserIdToNotificationsUser?: Array<NotificationsEventInterface>;
  NotificationsEvent_NotificationsEvent_senderUserIdToNotificationsUser?: Array<NotificationsEventInterface>;
}
