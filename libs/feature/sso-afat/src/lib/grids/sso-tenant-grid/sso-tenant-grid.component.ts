import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SsoTenantScalarFieldEnumInterface } from '@site15/rest-sdk-angular';
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
import { NgChanges, NzTableSortOrderDetectorPipe, getQueryMetaByParams } from '@nestjs-mod/afat';
import { RequestMeta, getQueryMeta } from '@nestjs-mod/misc';
import { SsoTenantFormComponent } from '../../forms/sso-tenant-form/sso-tenant-form.component';
import { SsoTenantModel } from '../../services/sso-tenant-mapper.service';
import { SsoTenantService } from '../../services/sso-tenant.service';

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
  selector: 'sso-tenant-grid',
  templateUrl: './sso-tenant-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SsoTenantGridComponent implements OnInit, OnChanges {
  @Input()
  forceLoadStream?: Observable<unknown>[];

  // New inputs for view mode
  @Input()
  viewMode = false;

  // New title input
  @Input()
  title?: string;

  items$ = new BehaviorSubject<SsoTenantModel[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);
  keys = [
    SsoTenantScalarFieldEnumInterface.id,
    SsoTenantScalarFieldEnumInterface.name,
    SsoTenantScalarFieldEnumInterface.clientId,
    SsoTenantScalarFieldEnumInterface.clientSecret,
    SsoTenantScalarFieldEnumInterface.public,
  ];
  columns = {
    [SsoTenantScalarFieldEnumInterface.id]: marker('sso-tenant.grid.columns.id'),
    [SsoTenantScalarFieldEnumInterface.name]: marker('sso-tenant.grid.columns.name'),
    [SsoTenantScalarFieldEnumInterface.clientId]: marker('sso-tenant.grid.columns.client-id'),
    [SsoTenantScalarFieldEnumInterface.clientSecret]: marker('sso-tenant.grid.columns.client-secret'),
    [SsoTenantScalarFieldEnumInterface.public]: marker('sso-tenant.grid.columns.public'),
  };
  SsoTenantScalarFieldEnumInterface = SsoTenantScalarFieldEnumInterface;

  private filters?: Record<string, string>;

  constructor(
    private readonly ssoTenantService: SsoTenantService,
    private readonly nzModalService: NzModalService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly translocoService: TranslocoService,
  ) {}

  ngOnChanges(changes: NgChanges<SsoTenantGridComponent>): void {
    // No relational inputs to watch in this component, but keeping the method for consistency
    this.loadMany();
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

    this.ssoTenantService
      .findMany({ filters, meta })
      .pipe(
        tap((result) => {
          this.items$.next(result.ssoTenants);
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

    const modal = this.nzModalService.create<SsoTenantFormComponent, SsoTenantFormComponent>({
      nzTitle: id
        ? this.translocoService.translate('sso-tenant.update-modal.title', {
            id,
          })
        : this.translocoService.translate('sso-tenant.create-modal.title'),
      nzContent: SsoTenantFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
      } as SsoTenantFormComponent,
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
    // In view mode, don't show the modal
    if (this.viewMode || !id) {
      return;
    }

    this.nzModalService.confirm({
      nzTitle: this.translocoService.translate(`sso-tenant.delete-modal.title`, {
        id,
      }),
      nzOkText: this.translocoService.translate('Yes'),
      nzCancelText: this.translocoService.translate('No'),
      nzOnOk: () => {
        this.ssoTenantService
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
