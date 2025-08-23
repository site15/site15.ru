import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { TIMEZONE_OFFSET } from '@nestjs-mod/misc';
import { MetricsGithubTeamRepositoryDtoInterface } from '@site15/rest-sdk-angular';
import { addHours } from 'date-fns';

export interface MetricsGithubTeamRepositoryModel
  extends Partial<Omit<MetricsGithubTeamRepositoryDtoInterface, 'createdAt' | 'updatedAt' | 'tenantId'>> {
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class MetricsGithubTeamRepositoryMapperService {
  constructor(protected readonly translocoService: TranslocoService) {}

  toModel(item?: MetricsGithubTeamRepositoryDtoInterface): MetricsGithubTeamRepositoryModel {
    return {
      ...item,
      createdAt: item?.createdAt ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET) : null,
      updatedAt: item?.updatedAt ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET) : null,
    };
  }

  toForm(model: MetricsGithubTeamRepositoryModel) {
    return {
      ...model,
    };
  }

  toJson(data: MetricsGithubTeamRepositoryModel) {
    return {
      // No fields to map as the DTO doesn't contain the relation fields
    };
  }
}
