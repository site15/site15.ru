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
import { MetricsGithubTeamRepositoryScalarFieldEnumInterface } from '@site15/rest-sdk-angular';
import { MetricsGithubTeamRepositoryService } from '../../services/metrics-github-team-repository.service';
import { MetricsGithubTeamRepositoryModel } from '../../services/metrics-github-team-repository-mapper.service';
import { MetricsGithubTeamRepositoryFormComponent } from '../../forms/metrics-github-team-repository-form/metrics-github-team-repository-form.component';

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
  ],
  selector: 'metrics-github-team-repository-grid',
  templateUrl: './metrics-github-team-repository-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MetricsGithubTeamRepositoryGridComponent implements OnInit {
  @Input()
  forceLoadStream?: Observable<unknown>[];
  items$ = new BehaviorSubject<MetricsGithubTeamRepositoryModel[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);

  keys = [
    MetricsGithubTeamRepositoryScalarFieldEnumInterface.id,
    MetricsGithubTeamRepositoryScalarFieldEnumInterface.teamId,
    MetricsGithubTeamRepositoryScalarFieldEnumInterface.repositoryId,
  ];

  columns = {
    [MetricsGithubTeamRepositoryScalarFieldEnumInterface.id]: marker('metrics-github-team-repository.grid.columns.id'),
    [MetricsGithubTeamRepositoryScalarFieldEnumInterface.teamId]: marker(
      'metrics-github-team-repository.grid.columns.teamId',
    ),
    [MetricsGithubTeamRepositoryScalarFieldEnumInterface.repositoryId]: marker(
      'metrics-github-team-repository.grid.columns.repositoryId',
    ),
  };

  MetricsGithubTeamRepositoryScalarFieldEnumInterface = MetricsGithubTeamRepositoryScalarFieldEnumInterface;

  private filters?: Record<string, string>;

  constructor(
    private readonly metricsGithubTeamRepositoryService: MetricsGithubTeamRepositoryService,
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

    this.metricsGithubTeamRepositoryService
      .findMany({ filters, meta })
      .pipe(
        tap((result) => {
          this.items$.next(result.metricsGithubTeamRepositories);
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
      MetricsGithubTeamRepositoryFormComponent,
      MetricsGithubTeamRepositoryFormComponent
    >({
      nzTitle: id
        ? this.translocoService.translate('metrics-github-team-repository.update-modal.title', {
            id,
          })
        : this.translocoService.translate('metrics-github-team-repository.create-modal.title'),
      nzContent: MetricsGithubTeamRepositoryFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
      } as MetricsGithubTeamRepositoryFormComponent,
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
    if (!id) {
      return;
    }
    this.nzModalService.confirm({
      nzTitle: this.translocoService.translate(`metrics-github-team-repository.delete-modal.title`, {
        id,
      }),
      nzOkText: this.translocoService.translate('Yes'),
      nzCancelText: this.translocoService.translate('No'),
      nzOnOk: () => {
        this.metricsGithubTeamRepositoryService
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
