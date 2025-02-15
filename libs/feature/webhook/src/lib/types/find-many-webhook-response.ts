import { FindManyResponseMeta } from '@nestjs-mod-sso/common';
import { ApiProperty } from '@nestjs/swagger';
import { Webhook } from '../generated/rest/dto/webhook.entity';

export class FindManyWebhookResponse {
  @ApiProperty({ type: () => [Webhook] })
  webhooks!: Webhook[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
