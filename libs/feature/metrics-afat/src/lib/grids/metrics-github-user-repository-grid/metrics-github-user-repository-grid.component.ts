import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MetricsGithubUserRepositoryScalarFieldEnumInterface } from '@site15/rest-sdk-angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import isEqual from 'lodash/fp/isEqual';
import omit from 'lodash/fp/omit';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
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
import { MetricsGithubUserRepositoryService } from '../../services/metrics-github-user-repository.service';
import { MetricsGithubUserRepositoryModel } from '../../services/metrics-github-user-repository-mapper.service';
import { MetricsGithubUserRepositoryFormComponent } from '../../forms/metrics-github-user-repository-form/metrics-github-user-repository-form.component';

@UntilDestroy()
@Component({
  imports: [
    NzGridModule,
    NzMenuModule,
    NzLayoutModule,
    NzTableModule,
    NzDividerModule,
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
  ],
  selector: 'metrics-github-user-repository-grid',
  templateUrl: './metrics-github-user-repository-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MetricsGithubUserRepositoryGridComponent implements OnInit {
  @Input()
  forceLoadStream?: Observable<unknown>[];

  @Input()
  userId?: string;

  @Input()
  repositoryId?: string;

  items$ = new BehaviorSubject<MetricsGithubUserRepositoryModel[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);
  keys = [
    MetricsGithubUserRepositoryScalarFieldEnumInterface.id,
    MetricsGithubUserRepositoryScalarFieldEnumInterface.role,
    MetricsGithubUserRepositoryScalarFieldEnumInterface.userId,
    MetricsGithubUserRepositoryScalarFieldEnumInterface.repositoryId,
  ];
  columns = {
    [MetricsGithubUserRepositoryScalarFieldEnumInterface.id]: marker('metrics-github-user-repository.grid.columns.id'),
    [MetricsGithubUserRepositoryScalarFieldEnumInterface.role]: marker(
      'metrics-github-user-repository.grid.columns.role',
    ),
    [MetricsGithubUserRepositoryScalarFieldEnumInterface.userId]: marker(
      'metrics-github-user-repository.grid.columns.user-id',
    ),
    [MetricsGithubUserRepositoryScalarFieldEnumInterface.repositoryId]: marker(
      'metrics-github-user-repository.grid.columns.repository-id',
    ),
  };
  MetricsGithubUserRepositoryScalarFieldEnumInterface = MetricsGithubUserRepositoryScalarFieldEnumInterface;

  private filters?: Record<string, string>;

  constructor(
    private readonly metricsGithubUserRepositoryService: MetricsGithubUserRepositoryService,
    private readonly nzModalService: NzModalService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly translocoService: TranslocoService,
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

    if (!filters['userId'] && this.userId) {
      filters['userId'] = this.userId;
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

    this.metricsGithubUserRepositoryService
      .findMany({ filters, meta })
      .pipe(
        tap((result) => {
          this.items$.next(result.metricsGithubUserRepositories);
          this.meta$.next({ ...result.meta, ...meta });
          this.filters = filters;
          this.selectedIds$.next([]);
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  showCreateOrUpdateModal(id?: string): void {
    const modal = this.nzModalService.create<
      MetricsGithubUserRepositoryFormComponent,
      MetricsGithubUserRepositoryFormComponent
    >({
      nzTitle: id
        ? this.translocoService.translate('metrics-github-user-repository.update-modal.title', {
            id,
          })
        : this.translocoService.translate('metrics-github-user-repository.create-modal.title'),
      nzContent: MetricsGithubUserRepositoryFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
        userId: this.userId,
        repositoryId: this.repositoryId,
      } as MetricsGithubUserRepositoryFormComponent,
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
          type: 'primary',
        },
      ],
    });
  }

  showDeleteModal(id?: string) {
    if (!id) {
      return;
    }
    this.nzModalService.confirm({
      nzTitle: this.translocoService.translate(`metrics-github-user-repository.delete-modal.title`, {
        id,
      }),
      nzOkText: this.translocoService.translate('Yes'),
      nzCancelText: this.translocoService.translate('No'),
      nzOnOk: () => {
        this.metricsGithubUserRepositoryService
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
