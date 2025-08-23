import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { TIMEZONE_OFFSET } from '@nestjs-mod/misc';
import { MetricsGithubRepositoryStatisticsDtoInterface } from '@site15/rest-sdk-angular';
import { addHours } from 'date-fns';

export interface MetricsGithubRepositoryStatisticsModel
  extends Partial<
    Omit<
      MetricsGithubRepositoryStatisticsDtoInterface,
      'lastCommitDate' | 'recordedAt' | 'createdAt' | 'updatedAt' | 'tenantId'
    >
  > {
  lastCommitDate?: Date | null;
  recordedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class MetricsGithubRepositoryStatisticsMapperService {
  constructor(protected readonly translocoService: TranslocoService) {}

  toModel(item?: MetricsGithubRepositoryStatisticsDtoInterface): MetricsGithubRepositoryStatisticsModel {
    return {
      ...item,
      lastCommitDate: item?.lastCommitDate ? addHours(new Date(item.lastCommitDate), TIMEZONE_OFFSET) : null,
      recordedAt: item?.recordedAt ? addHours(new Date(item.recordedAt), TIMEZONE_OFFSET) : null,
      createdAt: item?.createdAt ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET) : null,
      updatedAt: item?.updatedAt ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET) : null,
    };
  }

  toForm(model: MetricsGithubRepositoryStatisticsModel) {
    return {
      ...model,
      lastCommitDate: model.lastCommitDate ? new Date(model.lastCommitDate) : null,
      recordedAt: model.recordedAt ? new Date(model.recordedAt) : null,
    };
  }

  toJson(data: MetricsGithubRepositoryStatisticsModel) {
    return {
      periodType: data.periodType || '',
      starsCount: data.starsCount || null,
      forksCount: data.forksCount || null,
      contributorsCount: data.contributorsCount || null,
      commitsCount: data.commitsCount || null,
      lastCommitDate: data.lastCommitDate ? new Date(data.lastCommitDate) : null,
      recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date(),
    };
  }
}
