import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FilesService } from '@nestjs-mod/files-afat';
import { SsoUserScalarFieldEnumInterface } from '@nestjs-mod/sso-rest-sdk-angular';
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
import { NgChanges, NzTableSortOrderDetectorPipe, getQueryMetaByParams } from '@nestjs-mod/afat';
import { RequestMeta, getQueryMeta } from '@nestjs-mod/misc';
import { SsoInviteMembersFormComponent } from '../../forms/sso-invite-members-form/sso-invite-members-form.component';
import { SsoUserFormComponent } from '../../forms/sso-user-form/sso-user-form.component';
import { SsoUserModel } from '../../services/sso-user-mapper.service';
import { SsoUserService } from '../../services/sso-user.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
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
    NzSelectModule,
  ],
  selector: 'sso-user-grid',
  templateUrl: './sso-user-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SsoUserGridComponent implements OnInit, OnChanges {
  @Input()
  tenantId?: string;
  @Input()
  forceLoadStream?: Observable<unknown>[];

  tenantSearchField = new FormControl('');
  tenantSearchLoading$ = new BehaviorSubject(false);
  tenantSearchResult$ = new BehaviorSubject<{ label: string; value: string }[]>([{ label: 'ss', value: 'ss' }]);

  minioURL$ = new BehaviorSubject<string>('');
  items$ = new BehaviorSubject<SsoUserModel[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);
  keys = [
    SsoUserScalarFieldEnumInterface.id,
    // SsoUserScalarFieldEnumInterface.appData,
    //  SsoUserScalarFieldEnumInterface.birthdate,
    SsoUserScalarFieldEnumInterface.email,
    //  SsoUserScalarFieldEnumInterface.emailVerifiedAt,
    SsoUserScalarFieldEnumInterface.firstname,
    SsoUserScalarFieldEnumInterface.gender,
    // SsoUserScalarFieldEnumInterface.lastname,
    SsoUserScalarFieldEnumInterface.phone,
    // SsoUserScalarFieldEnumInterface.phoneVerifiedAt,
    SsoUserScalarFieldEnumInterface.picture,
    //  SsoUserScalarFieldEnumInterface.revokedAt,
    SsoUserScalarFieldEnumInterface.roles,
    SsoUserScalarFieldEnumInterface.username,
  ];
  columns = {
    [SsoUserScalarFieldEnumInterface.id]: marker('sso-user.grid.columns.id'),
    // [SsoUserScalarFieldEnumInterface.appData]: marker(
    //   'sso-user.grid.columns.app-data'
    // ),
    // [SsoUserScalarFieldEnumInterface.birthdate]: marker(
    //   'sso-user.grid.columns.birthdate'
    // ),
    [SsoUserScalarFieldEnumInterface.email]: marker('sso-user.grid.columns.email'),
    //   [SsoUserScalarFieldEnumInterface.emailVerifiedAt]: marker(
    //     'sso-user.grid.columns.email-verified-at'
    //   ),
    [SsoUserScalarFieldEnumInterface.firstname]: marker('sso-user.grid.columns.firstname'),
    [SsoUserScalarFieldEnumInterface.gender]: marker('sso-user.grid.columns.gender'),
    // [SsoUserScalarFieldEnumInterface.lastname]: marker(
    //   'sso-user.grid.columns.lastname'
    // ),
    [SsoUserScalarFieldEnumInterface.phone]: marker('sso-user.grid.columns.phone'),
    // [SsoUserScalarFieldEnumInterface.phoneVerifiedAt]: marker(
    //   'sso-user.grid.columns.phone-verified-at'
    // ),
    [SsoUserScalarFieldEnumInterface.picture]: marker('sso-user.grid.columns.picture'),
    //   [SsoUserScalarFieldEnumInterface.revokedAt]: marker(
    //     'sso-user.grid.columns.revoked-at'
    //   ),
    [SsoUserScalarFieldEnumInterface.roles]: marker('sso-user.grid.columns.roles'),
    [SsoUserScalarFieldEnumInterface.username]: marker('sso-user.grid.columns.username'),
  };
  SsoUserScalarFieldEnumInterface = SsoUserScalarFieldEnumInterface;

  private filters?: Record<string, string>;

  constructor(
    private readonly ssoTenantService: SsoTenantService,
    private readonly ssoUserService: SsoUserService,
    private readonly nzModalService: NzModalService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly translocoService: TranslocoService,
    private readonly filesService: FilesService,
  ) {
    this.minioURL$.next(this.filesService.getMinioURL() as string);
  }

  onTenantSearch(searchText: string) {
    this.loadManyTenants(searchText);
  }

  showInviteMembersModal(): void {
    const modal = this.nzModalService.create<SsoInviteMembersFormComponent, SsoInviteMembersFormComponent>({
      nzTitle: this.translocoService.translate('sso-user.invite-members-modal.title'),
      nzContent: SsoInviteMembersFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
      } as SsoInviteMembersFormComponent,
      nzFooter: [
        {
          label: this.translocoService.translate('Cancel'),
          onClick: () => {
            modal.close();
          },
        },
        {
          label: this.translocoService.translate('Send invitation links'),
          onClick: () => {
            modal.componentInstance?.afterSendInvitationLinks
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

  ngOnChanges(changes: NgChanges<SsoUserGridComponent>): void {
    // need for ignore dbl load
    if (!changes.tenantId?.firstChange) {
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

    merge(
      this.tenantSearchField.valueChanges.pipe(debounceTime(700), distinctUntilChanged()),
      ...(this.forceLoadStream ? this.forceLoadStream : []),
    )
      .pipe(
        tap(() => this.loadMany({ force: true })),
        untilDestroyed(this),
      )
      .subscribe();

    this.loadMany();
    this.loadManyTenants();
  }

  private loadManyTenants(searchText = '') {
    this.ssoTenantService
      .findMany({ filters: { search: searchText }, meta: { perPage: 10, curPage: 1, sort: { createdAt: 'desc' } } })
      .pipe(
        tap((result) => {
          this.tenantSearchResult$.next(
            result.ssoTenants.map((t) => ({ label: `${t.name} - ${t.slug}`, value: t.id! })),
          );
        }),
        untilDestroyed(this),
      )
      .subscribe();
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

    if (!filters['tenantId'] && this.tenantId) {
      filters['tenantId'] = this.tenantId;
    }
    if (this.tenantSearchField.value) {
      filters['tenantId'] = this.tenantSearchField.value;
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

    this.ssoUserService
      .findMany({ filters, meta })
      .pipe(
        tap((result) => {
          this.items$.next(result.ssoUsers);
          this.meta$.next({ ...result.meta, ...meta });
          this.filters = filters;
          this.selectedIds$.next([]);
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  showCreateOrUpdateModal(id?: string): void {
    const modal = this.nzModalService.create<SsoUserFormComponent, SsoUserFormComponent>({
      nzTitle: id
        ? this.translocoService.translate('sso-user.update-modal.title', {
            id,
          })
        : this.translocoService.translate('sso-user.create-modal.title'),
      nzContent: SsoUserFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
      } as SsoUserFormComponent,
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
}
