import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { TIMEZONE_OFFSET } from '@nestjs-mod/misc';
import { MetricsUserDtoInterface } from '@site15/rest-sdk-angular';
import { addHours } from 'date-fns';

export interface MetricsUserModel
  extends Partial<Omit<MetricsUserDtoInterface, 'createdAt' | 'updatedAt' | 'tenantId'>> {
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class MetricsUserMapperService {
  constructor(protected readonly translocoService: TranslocoService) {}

  toModel(item?: MetricsUserDtoInterface): MetricsUserModel {
    return {
      ...item,
      createdAt: item?.createdAt ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET) : null,
      updatedAt: item?.updatedAt ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET) : null,
    };
  }

  toForm(model: MetricsUserModel) {
    return {
      ...model,
    };
  }

  toJson(data: MetricsUserModel) {
    return {
      externalUserId: data.externalUserId || '',
      userRole: data.userRole || 'User',
    };
  }
}
