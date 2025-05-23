import { Injectable } from '@angular/core';
import { LangDefinition, TranslocoService } from '@jsverse/transloco';
import { TIMEZONE_OFFSET } from '@nestjs-mod/misc';
import {
  SsoProjectDtoInterface,
  SsoPublicProjectDtoInterface,
} from '@nestjs-mod/sso-rest-sdk-angular';
import { addHours } from 'date-fns';

export interface SsoProjectModel
  extends Partial<
    Omit<SsoProjectDtoInterface, 'createdAt' | 'updatedAt' | 'nameLocale'>
  > {
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class SsoProjectMapperService {
  constructor(protected readonly translocoService: TranslocoService) {}

  private getAvailableLangs() {
    return (
      this.translocoService.getAvailableLangs() as LangDefinition[]
    ).filter(
      (availableLang) =>
        availableLang.id !== this.translocoService.getDefaultLang()
    );
  }

  toPublicModel(item?: SsoPublicProjectDtoInterface): SsoProjectModel {
    return {
      ...item,
      createdAt: item?.createdAt
        ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET)
        : null,
      updatedAt: item?.updatedAt
        ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET)
        : null,
      ...Object.fromEntries(
        this.getAvailableLangs().map((a) => {
          return [`name_${a.id}`, item?.nameLocale?.[a.id] || ''];
        })
      ),
    };
  }

  toModel(item?: SsoProjectDtoInterface): SsoProjectModel {
    return {
      ...item,
      createdAt: item?.createdAt
        ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET)
        : null,
      updatedAt: item?.updatedAt
        ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET)
        : null,
      ...Object.fromEntries(
        this.getAvailableLangs().map((a) => {
          return [`name_${a.id}`, item?.nameLocale?.[a.id] || ''];
        })
      ),
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
      nameLocale: Object.fromEntries(
        this.getAvailableLangs().map((a) => {
          return [a.id, data[`name_${a.id}`] || ''];
        })
      ),
    };
  }
}
