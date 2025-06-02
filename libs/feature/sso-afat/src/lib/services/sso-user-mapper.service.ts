import { Injectable } from '@angular/core';
import { TIMEZONE_OFFSET, safeParseJson } from '@nestjs-mod/misc';
import { SsoUserDtoInterface } from '@nestjs-mod/sso-rest-sdk-angular';

import { addHours, format } from 'date-fns';

export interface SsoUserModel
  extends Partial<
    Omit<
      SsoUserDtoInterface,
      | 'emailVerifiedAt'
      | 'phoneVerifiedAt'
      | 'birthdate'
      | 'createdAt'
      | 'updatedAt'
      | 'appData'
      | 'roles'
    >
  > {
  roles: string[];
  appData?: string | null;
  emailVerifiedAt?: Date | null;
  phoneVerifiedAt?: Date | null;
  birthdate?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class SsoUserMapperService {
  toModel(item?: SsoUserDtoInterface): SsoUserModel {
    return {
      ...item,
      roles: item?.roles ? item.roles.split(',') : [],
      appData: item?.appData ? JSON.stringify(item.appData) : '',
      emailVerifiedAt: item?.emailVerifiedAt
        ? addHours(new Date(item.emailVerifiedAt), TIMEZONE_OFFSET)
        : null,
      phoneVerifiedAt: item?.phoneVerifiedAt
        ? addHours(new Date(item.phoneVerifiedAt), TIMEZONE_OFFSET)
        : null,
      birthdate: item?.birthdate
        ? addHours(new Date(item.birthdate), TIMEZONE_OFFSET)
        : null,
      createdAt: item?.createdAt
        ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET)
        : null,
      updatedAt: item?.updatedAt
        ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET)
        : null,
    };
  }

  toForm(model: SsoUserModel) {
    return {
      ...model,
      emailVerifiedAt: model.emailVerifiedAt
        ? format(model.emailVerifiedAt, 'yyyy-MM-dd HH:mm:ss')
        : null,
      phoneVerifiedAt: model.phoneVerifiedAt
        ? format(model.phoneVerifiedAt, 'yyyy-MM-dd HH:mm:ss')
        : null,
      birthdate: model.birthdate
        ? format(model.birthdate, 'yyyy-MM-dd HH:mm:ss')
        : null,
    };
  }

  toJson(data: SsoUserModel) {
    return {
      email: data.email || '',
      phone: data.phone || '',
      username: data.username || '',
      roles: data.roles.length ? data.roles.join(',') : '',
      firstname: data.firstname || '',
      lastname: data.lastname || '',
      gender: data.gender || '',
      birthdate: data.birthdate
        ? format(new Date(data.birthdate), 'yyyy-MM-dd HH:mm:ss')
        : undefined,
      picture: data.picture || '',
      appData: data.appData ? safeParseJson(data.appData) : null,
      revokedAt: data.revokedAt
        ? format(new Date(data.revokedAt), 'yyyy-MM-dd HH:mm:ss')
        : undefined,
      emailVerifiedAt: data.emailVerifiedAt
        ? format(new Date(data.emailVerifiedAt), 'yyyy-MM-dd HH:mm:ss')
        : undefined,
      phoneVerifiedAt: data.phoneVerifiedAt
        ? format(new Date(data.phoneVerifiedAt), 'yyyy-MM-dd HH:mm:ss')
        : undefined,
    };
  }
}
