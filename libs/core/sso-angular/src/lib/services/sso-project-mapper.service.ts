import { Injectable } from '@angular/core';
import { SsoProjectDtoInterface } from '@nestjs-mod-sso/app-angular-rest-sdk';
import { BROWSER_TIMEZONE_OFFSET } from '@nestjs-mod-sso/common-angular';
import { addHours } from 'date-fns';

export interface SsoProjectModel
  extends Partial<Omit<SsoProjectDtoInterface, 'createdAt' | 'updatedAt'>> {
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class SsoProjectMapperService {
  toModel(item?: SsoProjectDtoInterface): SsoProjectModel {
    return {
      ...item,
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
      clientId: data.clientId || '',
      clientSecret: data.clientSecret || '',
    };
  }
}
