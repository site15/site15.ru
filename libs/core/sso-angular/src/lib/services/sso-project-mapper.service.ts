import { Injectable } from '@angular/core';
import {
  SsoProjectDtoInterface,
  SsoPublicProjectDtoInterface,
} from '@nestjs-mod-sso/app-angular-rest-sdk';
import {
  BROWSER_TIMEZONE_OFFSET,
  safeParseJson,
} from '@nestjs-mod-sso/common-angular';
import { addHours } from 'date-fns';

export interface SsoProjectModel
  extends Partial<
    Omit<SsoProjectDtoInterface, 'createdAt' | 'updatedAt' | 'nameLocale'>
  > {
  nameLocale?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class SsoProjectMapperService {
  toPublicModel(item?: SsoPublicProjectDtoInterface): SsoProjectModel {
    return {
      ...item,
      nameLocale: item?.nameLocale ? JSON.stringify(item.nameLocale) : '',
      createdAt: item?.createdAt
        ? addHours(new Date(item.createdAt), BROWSER_TIMEZONE_OFFSET)
        : null,
      updatedAt: item?.updatedAt
        ? addHours(new Date(item.updatedAt), BROWSER_TIMEZONE_OFFSET)
        : null,
    };
  }

  toModel(item?: SsoProjectDtoInterface): SsoProjectModel {
    return {
      ...item,
      nameLocale: item?.nameLocale ? JSON.stringify(item.nameLocale) : '',
      createdAt: item?.createdAt
        ? addHours(new Date(item.createdAt), BROWSER_TIMEZONE_OFFSET)
        : null,
      updatedAt: item?.updatedAt
        ? addHours(new Date(item.updatedAt), BROWSER_TIMEZONE_OFFSET)
        : null,
    };
  }

  toForm(model: SsoProjectModel) {
    return {
      ...model,
    };
  }

  toJson(data: SsoProjectModel) {
    return {
      public: data.public === true,
      name: data.name || '',
      nameLocale: data.nameLocale ? safeParseJson(data.nameLocale) : null,
      clientId: data.clientId || '',
      clientSecret: data.clientSecret || '',
    };
  }
}
