import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, ViewContainerRef } from '@angular/core';
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
import { NgChanges, NzTableSortOrderDetectorPipe, getQueryMetaByParams } from '@nestjs-mod/afat';
import { RequestMeta, getQueryMeta } from '@nestjs-mod/misc';
import { MetricsGithubUserStatisticsScalarFieldEnumInterface } from '@site15/rest-sdk-angular';
import { MetricsGithubUserStatisticsService } from '../../services/metrics-github-user-statistics.service';
import { MetricsGithubUserStatisticsModel } from '../../services/metrics-github-user-statistics-mapper.service';
import { MetricsGithubUserStatisticsFormComponent } from '../../forms/metrics-github-user-statistics-form/metrics-github-user-statistics-form.component';

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
    NzFormModule,
    TranslocoDatePipe,
  ],
  selector: 'metrics-github-user-statistics-grid',
  templateUrl: './metrics-github-user-statistics-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MetricsGithubUserStatisticsGridComponent implements OnInit, OnChanges {
  @Input()
  forceLoadStream?: Observable<unknown>[];

  @Input()
  userId?: string;

  // New inputs for view mode
  @Input()
  viewMode = false;

  // New title input
  @Input()
  title?: string;

  items$ = new BehaviorSubject<MetricsGithubUserStatisticsModel[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);

  keys = [
    MetricsGithubUserStatisticsScalarFieldEnumInterface.id,
    MetricsGithubUserStatisticsScalarFieldEnumInterface.userId,
    MetricsGithubUserStatisticsScalarFieldEnumInterface.periodType,
    MetricsGithubUserStatisticsScalarFieldEnumInterface.followersCount,
    MetricsGithubUserStatisticsScalarFieldEnumInterface.followingCount,
    MetricsGithubUserStatisticsScalarFieldEnumInterface.recordedAt,
  ];

  columns = {
    [MetricsGithubUserStatisticsScalarFieldEnumInterface.id]: marker('metrics-github-user-statistics.grid.columns.id'),
    [MetricsGithubUserStatisticsScalarFieldEnumInterface.userId]: marker(
      'metrics-github-user-statistics.grid.columns.user-id',
    ),
    [MetricsGithubUserStatisticsScalarFieldEnumInterface.periodType]: marker(
      'metrics-github-user-statistics.grid.columns.period-type',
    ),
    [MetricsGithubUserStatisticsScalarFieldEnumInterface.followersCount]: marker(
      'metrics-github-user-statistics.grid.columns.followers-count',
    ),
    [MetricsGithubUserStatisticsScalarFieldEnumInterface.followingCount]: marker(
      'metrics-github-user-statistics.grid.columns.following-count',
    ),
    [MetricsGithubUserStatisticsScalarFieldEnumInterface.recordedAt]: marker(
      'metrics-github-user-statistics.grid.columns.recorded-at',
    ),
  };

  MetricsGithubUserStatisticsScalarFieldEnumInterface = MetricsGithubUserStatisticsScalarFieldEnumInterface;

  private filters?: Record<string, string>;

  constructor(
    private readonly metricsGithubUserStatisticsService: MetricsGithubUserStatisticsService,
    private readonly nzModalService: NzModalService,
    private readonly translocoService: TranslocoService,
    private readonly viewContainerRef: ViewContainerRef,
  ) {}

  ngOnChanges(changes: NgChanges<MetricsGithubUserStatisticsGridComponent>): void {
    // need for ignore dbl load
    if (!changes['userId']?.firstChange) {
      this.loadMany({ force: true });
    } else {
      this.loadMany();
    }
  }

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

    if (!filters['userId'] && this.userId) {
      filters['userId'] = this.userId;
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

    this.metricsGithubUserStatisticsService
      .findMany({ filters, meta })
      .pipe(
        tap((result) => {
          this.items$.next(result.metricsGithubUserStatistics);
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
      MetricsGithubUserStatisticsFormComponent,
      MetricsGithubUserStatisticsFormComponent
    >({
      nzTitle: id
        ? this.translocoService.translate('metrics-github-user-statistics.update-modal.title', {
            id,
          })
        : this.translocoService.translate('metrics-github-user-statistics.create-modal.title'),
      nzContent: MetricsGithubUserStatisticsFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
      } as MetricsGithubUserStatisticsFormComponent,
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
      nzTitle: this.translocoService.translate(`metrics-github-user-statistics.delete-modal.title`, {
        id,
      }),
      nzOkText: this.translocoService.translate('Yes'),
      nzCancelText: this.translocoService.translate('No'),
      nzOnOk: () => {
        this.metricsGithubUserStatisticsService
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
