import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { TIMEZONE_OFFSET } from '@nestjs-mod/misc';
import { MetricsGithubTeamDtoInterface } from '@site15/rest-sdk-angular';
import { addHours } from 'date-fns';

export interface MetricsGithubTeamModel
  extends Partial<Omit<MetricsGithubTeamDtoInterface, 'createdAt' | 'updatedAt' | 'tenantId'>> {
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class MetricsGithubTeamMapperService {
  constructor(protected readonly translocoService: TranslocoService) {}

  toModel(item?: MetricsGithubTeamDtoInterface): MetricsGithubTeamModel {
    return {
      ...item,
      createdAt: item?.createdAt ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET) : null,
      updatedAt: item?.updatedAt ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET) : null,
    };
  }

  toForm(model: MetricsGithubTeamModel) {
    return {
      ...model,
    };
  }

  toJson(data: MetricsGithubTeamModel) {
    return {
      name: data.name || '',
      description: data.description || null,
    };
  }
}
