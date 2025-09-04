import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { TIMEZONE_OFFSET } from '@nestjs-mod/misc';
import { MetricsSettingsDtoInterface } from '@site15/rest-sdk-angular';
import { addHours } from 'date-fns';

export interface MetricsSettingsModel
  extends Partial<Omit<MetricsSettingsDtoInterface, 'createdAt' | 'updatedAt' | 'tenantId'>> {
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class MetricsSettingsMapperService {
  constructor(protected readonly translocoService: TranslocoService) {}

  toModel(item?: MetricsSettingsDtoInterface): MetricsSettingsModel {
    if (!item) {
      return {};
    }
    return {
      ...item,
      createdAt: item?.createdAt ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET) : null,
      updatedAt: item?.updatedAt ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET) : null,
    };
  }

  toForm(model: MetricsSettingsModel) {
    return {
      ...model,
    };
  }

  toJson(data: MetricsSettingsModel) {
    return {
      enabled: data.enabled || false,
      githubToken: data.githubToken || null,
    };
  }
}
