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
import { MetricsGithubTeamScalarFieldEnumInterface } from '@site15/rest-sdk-angular';
import { MetricsGithubTeamService } from '../../services/metrics-github-team.service';
import { MetricsGithubTeamModel } from '../../services/metrics-github-team-mapper.service';
import { MetricsGithubTeamFormComponent } from '../../forms/metrics-github-team-form/metrics-github-team-form.component';

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
  selector: 'metrics-github-team-grid',
  templateUrl: './metrics-github-team-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MetricsGithubTeamGridComponent implements OnInit {
  @Input()
  forceLoadStream?: Observable<unknown>[];
  items$ = new BehaviorSubject<MetricsGithubTeamModel[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);

  keys = [
    MetricsGithubTeamScalarFieldEnumInterface.id,
    MetricsGithubTeamScalarFieldEnumInterface.name,
    MetricsGithubTeamScalarFieldEnumInterface.description,
  ];

  columns = {
    [MetricsGithubTeamScalarFieldEnumInterface.id]: marker('metrics-github-team.grid.columns.id'),
    [MetricsGithubTeamScalarFieldEnumInterface.name]: marker('metrics-github-team.grid.columns.name'),
    [MetricsGithubTeamScalarFieldEnumInterface.description]: marker('metrics-github-team.grid.columns.description'),
  };

  MetricsGithubTeamScalarFieldEnumInterface = MetricsGithubTeamScalarFieldEnumInterface;

  private filters?: Record<string, string>;

  constructor(
    private readonly metricsGithubTeamService: MetricsGithubTeamService,
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

    this.metricsGithubTeamService
      .findMany({ filters, meta })
      .pipe(
        tap((result) => {
          this.items$.next(result.metricsGithubTeams);
          this.meta$.next({ ...result.meta, ...meta });
          this.filters = filters;
          this.selectedIds$.next([]);
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  showCreateOrUpdateModal(id?: string): void {
    const modal = this.nzModalService.create<MetricsGithubTeamFormComponent, MetricsGithubTeamFormComponent>({
      nzTitle: id
        ? this.translocoService.translate('metrics-github-team.update-modal.title', {
            id,
          })
        : this.translocoService.translate('metrics-github-team.create-modal.title'),
      nzContent: MetricsGithubTeamFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
      } as MetricsGithubTeamFormComponent,
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
      nzTitle: this.translocoService.translate(`metrics-github-team.delete-modal.title`, {
        id,
      }),
      nzOkText: this.translocoService.translate('Yes'),
      nzCancelText: this.translocoService.translate('No'),
      nzOnOk: () => {
        this.metricsGithubTeamService
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
