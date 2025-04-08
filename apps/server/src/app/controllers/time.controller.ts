import { Controller, Get } from '@nestjs/common';

import {
  AllowEmptyAuthUser,
  UseAuthInterceptorsAndGuards,
} from '@nestjs-mod-sso/auth';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { interval, map, Observable } from 'rxjs';
import { ChangeTimeStream } from '../app.constants';
import { SsoClientGuard } from '../modules/sso-client.module';

@UseAuthInterceptorsAndGuards({
  guards: [SsoClientGuard],
  skipInterceptor: true,
})
// @AllowEmptyAuthUser()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/ws/time',
  transports: ['websocket'],
})
@Controller()
export class TimeController {
  @Get('/time')
  @ApiOkResponse({ type: Date })
  time() {
    return new Date();
  }

  @UseAuthInterceptorsAndGuards()
  @SubscribeMessage(ChangeTimeStream)
  onChangeTimeStream(): Observable<WsResponse<Date>> {
    return interval(1000).pipe(
      map(() => ({
        data: new Date(),
        event: ChangeTimeStream,
      }))
    );
  }
}
