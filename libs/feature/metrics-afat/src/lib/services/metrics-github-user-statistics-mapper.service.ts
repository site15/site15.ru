import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { TIMEZONE_OFFSET } from '@nestjs-mod/misc';
import { MetricsGithubUserStatisticsDtoInterface } from '@site15/rest-sdk-angular';
import { addHours } from 'date-fns';

export interface MetricsGithubUserStatisticsModel
  extends Partial<
    Omit<MetricsGithubUserStatisticsDtoInterface, 'recordedAt' | 'createdAt' | 'updatedAt' | 'tenantId'>
  > {
  recordedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class MetricsGithubUserStatisticsMapperService {
  constructor(protected readonly translocoService: TranslocoService) {}

  toModel(item?: MetricsGithubUserStatisticsDtoInterface): MetricsGithubUserStatisticsModel {
    return {
      ...item,
      recordedAt: item?.recordedAt ? new Date(item.recordedAt) : null,
      createdAt: item?.createdAt ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET) : null,
      updatedAt: item?.updatedAt ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET) : null,
    };
  }

  toForm(model: MetricsGithubUserStatisticsModel) {
    return {
      ...model,
      recordedAt: model.recordedAt ? new Date(model.recordedAt) : null,
    };
  }

  toJson(data: MetricsGithubUserStatisticsModel) {
    return {
      periodType: data.periodType || '',
      followersCount: data.followersCount || null,
      followingCount: data.followingCount || null,
      recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date(),
    };
  }
}
