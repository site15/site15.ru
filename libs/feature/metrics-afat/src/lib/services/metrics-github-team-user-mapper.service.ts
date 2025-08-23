import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { TIMEZONE_OFFSET } from '@nestjs-mod/misc';
import { MetricsGithubTeamUserDtoInterface } from '@site15/rest-sdk-angular';
import { addHours } from 'date-fns';

export interface MetricsGithubTeamUserModel
  extends Partial<Omit<MetricsGithubTeamUserDtoInterface, 'createdAt' | 'updatedAt' | 'tenantId'>> {
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class MetricsGithubTeamUserMapperService {
  constructor(protected readonly translocoService: TranslocoService) {}

  toModel(item?: MetricsGithubTeamUserDtoInterface): MetricsGithubTeamUserModel {
    return {
      ...item,
      createdAt: item?.createdAt ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET) : null,
      updatedAt: item?.updatedAt ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET) : null,
    };
  }

  toForm(model: MetricsGithubTeamUserModel) {
    return {
      ...model,
    };
  }

  toJson(data: MetricsGithubTeamUserModel) {
    return {
      role: data.role || null,
    };
  }
}
