import { Injectable } from '@angular/core';
import { SsoRefreshSessionDtoInterface } from '@nestjs-mod-sso/app-angular-rest-sdk';
import {
  BROWSER_TIMEZONE_OFFSET,
  safeParseJson,
} from '@nestjs-mod-sso/common-angular';
import { addHours } from 'date-fns';

export interface SsoSessionModel
  extends Partial<
    Omit<SsoRefreshSessionDtoInterface, 'createdAt' | 'updatedAt' | 'userData'>
  > {
  userData?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class SsoSessionMapperService {
  toModel(item?: SsoRefreshSessionDtoInterface): SsoSessionModel {
    return {
      ...item,
      userData: item?.userData ? JSON.stringify(item.userData) : '',
      createdAt: item?.createdAt
        ? addHours(new Date(item.createdAt), BROWSER_TIMEZONE_OFFSET)
        : null,
      updatedAt: item?.updatedAt
        ? addHours(new Date(item.updatedAt), BROWSER_TIMEZONE_OFFSET)
        : null,
    };
  }

  toForm(model: SsoSessionModel) {
    return {
      ...model,
    };
  }

  toJson(data: SsoSessionModel) {
    return {
      userData: data.userData ? safeParseJson(data.userData) : null,
      userAgent: data.userAgent || '',
      userIp: data.userIp || '',
      expiresIn: data.expiresIn || undefined,
      enabled: data.enabled || undefined,
    };
  }
}
