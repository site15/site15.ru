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
import { SsoEmailTemplateScalarFieldEnumInterface } from '@nestjs-mod/sso-rest-sdk-angular';
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
import { SsoEmailTemplateFormComponent } from '../../forms/sso-email-template-form/sso-email-template-form.component';
import { SsoEmailTemplateModel } from '../../services/sso-email-template-mapper.service';
import { SsoEmailTemplateService } from '../../services/sso-email-template.service';

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
  selector: 'sso-email-template-grid',
  templateUrl: './sso-email-template-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SsoEmailTemplateGridComponent implements OnInit {
  @Input()
  forceLoadStream?: Observable<unknown>[];

  items$ = new BehaviorSubject<SsoEmailTemplateModel[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);
  keys = [
    SsoEmailTemplateScalarFieldEnumInterface.id,
    SsoEmailTemplateScalarFieldEnumInterface.operationName,
    SsoEmailTemplateScalarFieldEnumInterface.subject,
    SsoEmailTemplateScalarFieldEnumInterface.text,
  ];
  columns = {
    [SsoEmailTemplateScalarFieldEnumInterface.id]: marker(
      'sso-email-template.grid.columns.id'
    ),
    [SsoEmailTemplateScalarFieldEnumInterface.operationName]: marker(
      'sso-email-template.grid.columns.operation-name'
    ),
    [SsoEmailTemplateScalarFieldEnumInterface.subject]: marker(
      'sso-email-template.grid.columns.subject'
    ),
    [SsoEmailTemplateScalarFieldEnumInterface.text]: marker(
      'sso-email-template.grid.columns.text'
    ),
  };
  SsoEmailTemplateScalarFieldEnumInterface =
    SsoEmailTemplateScalarFieldEnumInterface;

  private filters?: Record<string, string>;

  constructor(
    private readonly ssoEmailTemplateService: SsoEmailTemplateService,
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

    this.ssoEmailTemplateService
      .findMany({ filters, meta })
      .pipe(
        tap((result) => {
          this.items$.next(result.ssoEmailTemplates);
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
      SsoEmailTemplateFormComponent,
      SsoEmailTemplateFormComponent
    >({
      nzWidth: '700px',
      nzTitle: id
        ? this.translocoService.translate(
            'sso-email-template.update-modal.title',
            {
              id,
            }
          )
        : this.translocoService.translate(
            'sso-email-template.create-modal.title'
          ),
      nzContent: SsoEmailTemplateFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
      } as SsoEmailTemplateFormComponent,
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
