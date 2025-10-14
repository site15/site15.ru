import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import isEqual from 'lodash/fp/isEqual';
import omit from 'lodash/fp/omit';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { BehaviorSubject, Observable, debounceTime, distinctUntilChanged, merge, tap } from 'rxjs';

import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { TranslocoDatePipe } from '@jsverse/transloco-locale';
import { NzTableSortOrderDetectorPipe, getQueryMetaByParams } from '@nestjs-mod/afat';
import { RequestMeta, getQueryMeta } from '@nestjs-mod/misc';
import { MetricsGithubRepositoryStatisticsScalarFieldEnumInterface } from '@site15/rest-sdk-angular';
import { MetricsGithubRepositoryStatisticsFormComponent } from '../../forms/metrics-github-repository-statistics-form/metrics-github-repository-statistics-form.component';
import { MetricsGithubRepositoryStatisticsModel } from '../../services/metrics-github-repository-statistics-mapper.service';
import { MetricsGithubRepositoryStatisticsService } from '../../services/metrics-github-repository-statistics.service';

@UntilDestroy()
@Component({
  imports: [
    NzGridModule,
    NzMenuModule,
    NzLayoutModule,
    NzTableModule,
    NzDividerModule,
    NzCardModule,
    CommonModule,
    RouterModule,
    NzModalModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableSortOrderDetectorPipe,
    TranslocoDirective,
    TranslocoPipe,
    TranslocoDatePipe,
    NzFormModule,
  ],
  selector: 'metrics-github-repository-statistics-grid',
  templateUrl: './metrics-github-repository-statistics-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MetricsGithubRepositoryStatisticsGridComponent implements OnInit {
  @Input()
  forceLoadStream?: Observable<unknown>[];

  @Input()
  repositoryId?: string;

  // New inputs for view mode
  @Input()
  viewMode = false;

  // New title input
  @Input()
  title?: string;

  items$ = new BehaviorSubject<MetricsGithubRepositoryStatisticsModel[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);

  keys = [
    MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.id,
    MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.repositoryId,
    MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.periodType,
    MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.starsCount,
    MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.forksCount,
    MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.contributorsCount,
    MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.commitsCount,
    MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.lastCommitDate,
    MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.recordedAt,
  ];

  columns = {
    [MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.id]: marker(
      'metrics-github-repository-statistics.grid.columns.id',
    ),
    [MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.repositoryId]: marker(
      'metrics-github-repository-statistics.grid.columns.repositoryId',
    ),
    [MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.periodType]: marker(
      'metrics-github-repository-statistics.grid.columns.periodType',
    ),
    [MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.starsCount]: marker(
      'metrics-github-repository-statistics.grid.columns.starsCount',
    ),
    [MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.forksCount]: marker(
      'metrics-github-repository-statistics.grid.columns.forksCount',
    ),
    [MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.contributorsCount]: marker(
      'metrics-github-repository-statistics.grid.columns.contributorsCount',
    ),
    [MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.commitsCount]: marker(
      'metrics-github-repository-statistics.grid.columns.commitsCount',
    ),
    [MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.lastCommitDate]: marker(
      'metrics-github-repository-statistics.grid.columns.lastCommitDate',
    ),
    [MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.recordedAt]: marker(
      'metrics-github-repository-statistics.grid.columns.recordedAt',
    ),
  };

  MetricsGithubRepositoryStatisticsScalarFieldEnumInterface = MetricsGithubRepositoryStatisticsScalarFieldEnumInterface;

  private filters?: Record<string, string>;

  constructor(
    private readonly metricsGithubRepositoryStatisticsService: MetricsGithubRepositoryStatisticsService,
    private readonly nzModalService: NzModalService,
    private readonly translocoService: TranslocoService,
    private readonly viewContainerRef: ViewContainerRef,
  ) {}

  ngOnInit(): void {
    merge(
      this.searchField.valueChanges.pipe(debounceTime(700), distinctUntilChanged()),
      ...(this.forceLoadStream ? this.forceLoadStream : []),
    )
      .pipe(
        tap(() => this.loadMany({ force: true })),
        untilDestroyed(this),
      )
      .subscribe();

    this.loadMany();
  }

  loadMany(args?: {
    filters?: Record<string, string>;
    meta?: RequestMeta;
    queryParams?: NzTableQueryParams;
    force?: boolean;
  }) {
    let meta = { meta: {}, ...(args || {}) }.meta as RequestMeta;
    const { queryParams, filters } = { filters: {}, ...(args || {}) };

    if (!args?.force && queryParams) {
      meta = getQueryMetaByParams(queryParams);
    }

    meta = getQueryMeta(meta, this.meta$.value);

    if (!filters['search'] && this.searchField.value) {
      filters['search'] = this.searchField.value;
    }

    if (!filters['repositoryId'] && this.repositoryId) {
      filters['repositoryId'] = this.repositoryId;
    }

    if (
      !args?.force &&
      isEqual(
        omit(['totalResults'], { ...meta, ...filters }),
        omit(['totalResults'], {
          ...this.meta$.value,
          ...this.filters,
        }),
      )
    ) {
      return;
    }

    this.metricsGithubRepositoryStatisticsService
      .findMany({ filters, meta })
      .pipe(
        tap((result) => {
          this.items$.next(result.metricsGithubRepositoryStatistics);
          this.meta$.next({ ...result.meta, ...meta });
          this.filters = filters;
          this.selectedIds$.next([]);
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  showCreateOrUpdateModal(id?: string): void {
    // In view mode, don't show the modal
    if (this.viewMode) {
      return;
    }

    const modal = this.nzModalService.create<
      MetricsGithubRepositoryStatisticsFormComponent,
      MetricsGithubRepositoryStatisticsFormComponent
    >({
      nzTitle: id
        ? this.translocoService.translate('metrics-github-repository-statistics.update-modal.title', {
            id,
          })
        : this.translocoService.translate('metrics-github-repository-statistics.create-modal.title'),
      nzContent: MetricsGithubRepositoryStatisticsFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
        repositoryId: this.repositoryId,
      } as MetricsGithubRepositoryStatisticsFormComponent,
      nzFooter: [
        {
          label: this.translocoService.translate('Cancel'),
          onClick: () => {
            modal.close();
          },
        },
        {
          label: id ? this.translocoService.translate('Save') : this.translocoService.translate('Create'),
          onClick: () => {
            modal.componentInstance?.afterUpdate
              .pipe(
                tap(() => {
                  modal.close();
                  this.loadMany({ force: true });
                }),
                untilDestroyed(modal.componentInstance),
              )
              .subscribe();

            modal.componentInstance?.afterCreate
              .pipe(
                tap(() => {
                  modal.close();
                  this.loadMany({ force: true });
                }),
                untilDestroyed(modal.componentInstance),
              )
              .subscribe();

            modal.componentInstance?.submitForm();
          },
        },
      ],
    });
  }

  showDeleteModal(id?: string) {
    // In view mode, don't show the modal
    if (this.viewMode || !id) {
      return;
    }

    this.nzModalService.confirm({
      nzTitle: this.translocoService.translate(`metrics-github-repository-statistics.delete-modal.title`, {
        id,
      }),
      nzOkText: this.translocoService.translate('Yes'),
      nzCancelText: this.translocoService.translate('No'),
      nzOnOk: () => {
        this.metricsGithubRepositoryStatisticsService
          .deleteOne(id)
          .pipe(
            tap(() => {
              this.loadMany({ force: true });
            }),
            untilDestroyed(this),
          )
          .subscribe();
      },
    });
  }
}
