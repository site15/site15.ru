import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SsoProjectScalarFieldEnumInterface } from '@nestjs-mod/sso-rest-sdk-angular';
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
import {
  BehaviorSubject,
  Observable,
  debounceTime,
  distinctUntilChanged,
  merge,
  tap,
} from 'rxjs';

import {
  TranslocoDirective,
  TranslocoPipe,
  TranslocoService,
} from '@jsverse/transloco';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { TranslocoDatePipe } from '@jsverse/transloco-locale';
import {
  NzTableSortOrderDetectorPipe,
  getQueryMetaByParams,
} from '@nestjs-mod/afat';
import { RequestMeta, getQueryMeta } from '@nestjs-mod/misc';
import { SsoProjectFormComponent } from '../../forms/sso-project-form/sso-project-form.component';
import { SsoProjectModel } from '../../services/sso-project-mapper.service';
import { SsoProjectService } from '../../services/sso-project.service';

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
  selector: 'sso-project-grid',
  templateUrl: './sso-project-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SsoProjectGridComponent implements OnInit {
  @Input()
  forceLoadStream?: Observable<unknown>[];

  items$ = new BehaviorSubject<SsoProjectModel[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);
  keys = [
    SsoProjectScalarFieldEnumInterface.id,
    SsoProjectScalarFieldEnumInterface.name,
    SsoProjectScalarFieldEnumInterface.clientId,
    SsoProjectScalarFieldEnumInterface.clientSecret,
    SsoProjectScalarFieldEnumInterface.public,
  ];
  columns = {
    [SsoProjectScalarFieldEnumInterface.id]: marker(
      'sso-project.grid.columns.id'
    ),
    [SsoProjectScalarFieldEnumInterface.name]: marker(
      'sso-project.grid.columns.name'
    ),
    [SsoProjectScalarFieldEnumInterface.clientId]: marker(
      'sso-project.grid.columns.client-id'
    ),
    [SsoProjectScalarFieldEnumInterface.clientSecret]: marker(
      'sso-project.grid.columns.client-secret'
    ),
    [SsoProjectScalarFieldEnumInterface.public]: marker(
      'sso-project.grid.columns.public'
    ),
  };
  SsoProjectScalarFieldEnumInterface = SsoProjectScalarFieldEnumInterface;

  private filters?: Record<string, string>;

  constructor(
    private readonly ssoProjectService: SsoProjectService,
    private readonly nzModalService: NzModalService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    merge(
      this.searchField.valueChanges.pipe(
        debounceTime(700),
        distinctUntilChanged()
      ),
      ...(this.forceLoadStream ? this.forceLoadStream : [])
    )
      .pipe(
        tap(() => this.loadMany({ force: true })),
        untilDestroyed(this)
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
        })
      )
    ) {
      return;
    }

    this.ssoProjectService
      .findMany({ filters, meta })
      .pipe(
        tap((result) => {
          this.items$.next(result.ssoProjects);
          this.meta$.next({ ...result.meta, ...meta });
          this.filters = filters;
          this.selectedIds$.next([]);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  showCreateOrUpdateModal(id?: string): void {
    const modal = this.nzModalService.create<
      SsoProjectFormComponent,
      SsoProjectFormComponent
    >({
      nzTitle: id
        ? this.translocoService.translate('sso-project.update-modal.title', {
            id,
          })
        : this.translocoService.translate('sso-project.create-modal.title'),
      nzContent: SsoProjectFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
      } as SsoProjectFormComponent,
      nzFooter: [
        {
          label: this.translocoService.translate('Cancel'),
          onClick: () => {
            modal.close();
          },
        },
        {
          label: id
            ? this.translocoService.translate('Save')
            : this.translocoService.translate('Create'),
          onClick: () => {
            modal.componentInstance?.afterUpdate
              .pipe(
                tap(() => {
                  modal.close();
                  this.loadMany({ force: true });
                }),
                untilDestroyed(modal.componentInstance)
              )
              .subscribe();

            modal.componentInstance?.afterCreate
              .pipe(
                tap(() => {
                  modal.close();
                  this.loadMany({ force: true });
                }),
                untilDestroyed(modal.componentInstance)
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
      nzTitle: this.translocoService.translate(
        `sso-project.delete-modal.title`,
        {
          id,
        }
      ),
      nzOkText: this.translocoService.translate('Yes'),
      nzCancelText: this.translocoService.translate('No'),
      nzOnOk: () => {
        this.ssoProjectService
          .deleteOne(id)
          .pipe(
            tap(() => {
              this.loadMany({ force: true });
            }),
            untilDestroyed(this)
          )
          .subscribe();
      },
    });
  }
}
