import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
  NgChanges,
  NzTableSortOrderDetectorPipe,
  getQueryMetaByParams,
} from '@nestjs-mod/afat';
import { RequestMeta, getQueryMeta } from '@nestjs-mod/misc';
import { SsoRefreshSessionScalarFieldEnumInterface } from '@nestjs-mod/sso-rest-sdk-angular';
import { SsoSessionFormComponent } from '../../forms/sso-session-form/sso-session-form.component';
import { SsoSessionModel } from '../../services/sso-session-mapper.service';
import { SsoSessionService } from '../../services/sso-session.service';

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
  selector: 'sso-session-grid',
  templateUrl: './sso-session-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SsoSessionGridComponent implements OnInit, OnChanges {
  @Input({ required: true })
  userId!: string | undefined;
  @Input()
  forceLoadStream?: Observable<unknown>[];

  items$ = new BehaviorSubject<SsoSessionModel[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);
  keys = [
    SsoRefreshSessionScalarFieldEnumInterface.id,
    SsoRefreshSessionScalarFieldEnumInterface.userAgent,
    SsoRefreshSessionScalarFieldEnumInterface.fingerprint,
    SsoRefreshSessionScalarFieldEnumInterface.userIp,
    SsoRefreshSessionScalarFieldEnumInterface.expiresAt,
    SsoRefreshSessionScalarFieldEnumInterface.userData,
    SsoRefreshSessionScalarFieldEnumInterface.enabled,
  ];
  columns = {
    [SsoRefreshSessionScalarFieldEnumInterface.id]: marker(
      'sso-session.grid.columns.id'
    ),
    [SsoRefreshSessionScalarFieldEnumInterface.userAgent]: marker(
      'sso-session.grid.columns.user-agent'
    ),
    [SsoRefreshSessionScalarFieldEnumInterface.fingerprint]: marker(
      'sso-session.grid.columns.fingerprint'
    ),
    [SsoRefreshSessionScalarFieldEnumInterface.userIp]: marker(
      'sso-session.grid.columns.user-ip'
    ),
    [SsoRefreshSessionScalarFieldEnumInterface.expiresAt]: marker(
      'sso-session.grid.columns.expires-at'
    ),
    [SsoRefreshSessionScalarFieldEnumInterface.userData]: marker(
      'sso-session.grid.columns.user-data'
    ),
    [SsoRefreshSessionScalarFieldEnumInterface.enabled]: marker(
      'sso-session.grid.columns.enabled'
    ),
  };
  SsoSessionScalarFieldEnumInterface =
    SsoRefreshSessionScalarFieldEnumInterface;

  private filters?: Record<string, string>;

  constructor(
    private readonly ssoSessionService: SsoSessionService,
    private readonly nzModalService: NzModalService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly translocoService: TranslocoService
  ) {}

  ngOnChanges(changes: NgChanges<SsoSessionGridComponent>): void {
    // need for ignore dbl load
    if (!changes['userId'].firstChange) {
      this.loadMany({ force: true });
    } else {
      this.loadMany();
    }
  }

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
        })
      )
    ) {
      return;
    }
    if (!filters['userId']) {
      this.items$.next([]);
      this.selectedIds$.next([]);
    } else {
      this.ssoSessionService
        .findMany({ filters, meta })
        .pipe(
          tap((result) => {
            this.items$.next(result.ssoRefreshSessions);
            this.meta$.next({ ...result.meta, ...meta });
            this.filters = filters;
            this.selectedIds$.next([]);
          }),
          untilDestroyed(this)
        )
        .subscribe();
    }
  }

  showCreateOrUpdateModal(id?: string): void {
    const modal = this.nzModalService.create<
      SsoSessionFormComponent,
      SsoSessionFormComponent
    >({
      nzTitle: id
        ? this.translocoService.translate('sso-session.update-modal.title', {
            id,
          })
        : this.translocoService.translate('sso-session.create-modal.title'),
      nzContent: SsoSessionFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
      } as SsoSessionFormComponent,
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
}
