import { Injectable } from '@angular/core';
import { TIMEZONE_OFFSET, safeParseJson } from '@nestjs-mod/misc';
import { SsoRefreshSessionDtoInterface } from '@nestjs-mod/sso-rest-sdk-angular';
import { addHours, format } from 'date-fns';

export interface SsoSessionModel
  extends Partial<
    Omit<
      SsoRefreshSessionDtoInterface,
      'createdAt' | 'updatedAt' | 'userData' | 'expiresAt'
    >
  > {
  userData?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  expiresAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class SsoSessionMapperService {
  toModel(item?: SsoRefreshSessionDtoInterface): SsoSessionModel {
    return {
      ...item,
      userData: item?.userData ? JSON.stringify(item.userData) : '',
      expiresAt: item?.expiresAt
        ? addHours(new Date(item.expiresAt), TIMEZONE_OFFSET)
        : null,
      createdAt: item?.createdAt
        ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET)
        : null,
      updatedAt: item?.updatedAt
        ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET)
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
      expiresAt: data.expiresAt
        ? format(new Date(data.expiresAt), 'yyyy-MM-dd HH:mm:ss')
        : undefined,
      enabled: data.enabled === true,
    };
  }
}
