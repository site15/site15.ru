import { Injectable } from '@angular/core';
import { LangDefinition, TranslocoService } from '@jsverse/transloco';
import { TIMEZONE_OFFSET } from '@nestjs-mod/misc';
import { SsoTenantDtoInterface, SsoPublicTenantDtoInterface } from '@nestjs-mod/sso-rest-sdk-angular';
import { addHours } from 'date-fns';

export interface SsoTenantModel extends Partial<Omit<SsoTenantDtoInterface, 'createdAt' | 'updatedAt' | 'nameLocale'>> {
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class SsoTenantMapperService {
  constructor(protected readonly translocoService: TranslocoService) {}

  private getAvailableLangs() {
    return (this.translocoService.getAvailableLangs() as LangDefinition[]).filter(
      (availableLang) => availableLang.id !== this.translocoService.getDefaultLang(),
    );
  }

  toPublicModel(item?: SsoPublicTenantDtoInterface): SsoTenantModel {
    return {
      ...item,
      createdAt: item?.createdAt ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET) : null,
      updatedAt: item?.updatedAt ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET) : null,
      ...Object.fromEntries(
        this.getAvailableLangs().map((a) => {
          return [`name_${a.id}`, item?.nameLocale?.[a.id] || ''];
        }),
      ),
    };
  }

  toModel(item?: SsoTenantDtoInterface): SsoTenantModel {
    return {
      ...item,
      createdAt: item?.createdAt ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET) : null,
      updatedAt: item?.updatedAt ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET) : null,
      ...Object.fromEntries(
        this.getAvailableLangs().map((a) => {
          return [`name_${a.id}`, item?.nameLocale?.[a.id] || ''];
        }),
      ),
    };
  }

  toForm(model: SsoTenantModel) {
    return {
      ...model,
    };
  }

  toJson(data: SsoTenantModel) {
    return {
      public: data.public === true,
      name: data.name || '',
      clientId: data.clientId || '',
      clientSecret: data.clientSecret || '',
      nameLocale: Object.fromEntries(
        this.getAvailableLangs().map((a) => {
          return [a.id, data[`name_${a.id}`] || ''];
        }),
      ),
      slug: data.slug || '',
      enabled: data.enabled === true,
    };
  }
}
