import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MetricsGithubRepositoryScalarFieldEnumInterface } from '@site15/rest-sdk-angular';
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
import { MetricsGithubRepositoryService } from '../../services/metrics-github-repository.service';
import { MetricsGithubRepositoryModel } from '../../services/metrics-github-repository-mapper.service';
import { MetricsGithubRepositoryFormComponent } from '../../forms/metrics-github-repository-form/metrics-github-repository-form.component';

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
  selector: 'metrics-github-repository-grid',
  templateUrl: './metrics-github-repository-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MetricsGithubRepositoryGridComponent implements OnInit {
  @Input()
  forceLoadStream?: Observable<unknown>[];

  items$ = new BehaviorSubject<MetricsGithubRepositoryModel[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);
  keys = [
    MetricsGithubRepositoryScalarFieldEnumInterface.id,
    MetricsGithubRepositoryScalarFieldEnumInterface.name,
    MetricsGithubRepositoryScalarFieldEnumInterface.owner,
    MetricsGithubRepositoryScalarFieldEnumInterface.fork,
    MetricsGithubRepositoryScalarFieldEnumInterface.private,
  ];
  columns = {
    [MetricsGithubRepositoryScalarFieldEnumInterface.id]: marker('metrics-github-repository.grid.columns.id'),
    [MetricsGithubRepositoryScalarFieldEnumInterface.name]: marker('metrics-github-repository.grid.columns.name'),
    [MetricsGithubRepositoryScalarFieldEnumInterface.owner]: marker('metrics-github-repository.grid.columns.owner'),
    [MetricsGithubRepositoryScalarFieldEnumInterface.fork]: marker('metrics-github-repository.grid.columns.fork'),
    [MetricsGithubRepositoryScalarFieldEnumInterface.private]: marker('metrics-github-repository.grid.columns.private'),
  };
  MetricsGithubRepositoryScalarFieldEnumInterface = MetricsGithubRepositoryScalarFieldEnumInterface;

  private filters?: Record<string, string>;

  constructor(
    private readonly metricsGithubRepositoryService: MetricsGithubRepositoryService,
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

    this.metricsGithubRepositoryService
      .findMany({ filters, meta })
      .pipe(
        tap((result) => {
          this.items$.next(result.metricsGithubRepositories);
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
      MetricsGithubRepositoryFormComponent,
      MetricsGithubRepositoryFormComponent
    >({
      nzTitle: id
        ? this.translocoService.translate('metrics-github-repository.update-modal.title', {
            id,
          })
        : this.translocoService.translate('metrics-github-repository.create-modal.title'),
      nzContent: MetricsGithubRepositoryFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
      } as MetricsGithubRepositoryFormComponent,
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
      nzTitle: this.translocoService.translate(`metrics-github-repository.delete-modal.title`, {
        id,
      }),
      nzOkText: this.translocoService.translate('Yes'),
      nzCancelText: this.translocoService.translate('No'),
      nzOnOk: () => {
        this.metricsGithubRepositoryService
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
