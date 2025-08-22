import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { TIMEZONE_OFFSET } from '@nestjs-mod/misc';
import { MetricsGithubRepositoryDtoInterface } from '@site15/rest-sdk-angular';
import { addHours } from 'date-fns';

export interface MetricsGithubRepositoryModel
  extends Partial<Omit<MetricsGithubRepositoryDtoInterface, 'createdAt' | 'updatedAt' | 'tenantId'>> {
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class MetricsGithubRepositoryMapperService {
  constructor(protected readonly translocoService: TranslocoService) {}

  toModel(item?: MetricsGithubRepositoryDtoInterface): MetricsGithubRepositoryModel {
    return {
      ...item,
      createdAt: item?.createdAt ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET) : null,
      updatedAt: item?.updatedAt ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET) : null,
    };
  }

  toForm(model: MetricsGithubRepositoryModel) {
    return {
      ...model,
    };
  }

  toJson(data: MetricsGithubRepositoryModel) {
    return {
      name: data.name || '',
      owner: data.owner || '',
      private: data.private === true,
      fork: data.fork === true,
    };
  }
}
