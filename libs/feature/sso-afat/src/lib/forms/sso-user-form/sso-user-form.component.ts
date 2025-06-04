import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ValidationErrorMetadataInterface } from '@nestjs-mod/sso-rest-sdk-angular';
import { ValidationService } from '@nestjs-mod/afat';
import { FilesService } from '@nestjs-mod/files-afat';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import {
  BehaviorSubject,
  catchError,
  map,
  mergeMap,
  of,
  tap,
  throwError,
} from 'rxjs';
import { SsoUserFormService } from '../../services/sso-user-form.service';
import {
  SsoUserMapperService,
  SsoUserModel,
} from '../../services/sso-user-mapper.service';
import { SsoUserService } from '../../services/sso-user.service';

@UntilDestroy()
@Component({
  imports: [
    FormlyModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    TranslocoPipe,
  ],
  selector: 'sso-user-form',
  templateUrl: './sso-user-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SsoUserFormComponent implements OnInit {
  @Input()
  id?: string;

  @Input()
  hideButtons?: boolean;

  @Output()
  afterFind = new EventEmitter<SsoUserModel>();

  @Output()
  afterCreate = new EventEmitter<SsoUserModel>();

  @Output()
  afterUpdate = new EventEmitter<SsoUserModel>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: SsoUserFormComponent,
    private readonly ssoUserService: SsoUserService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly ssoUserFormService: SsoUserFormService,
    private readonly ssoUserMapperService: SsoUserMapperService,
    private readonly validationService: ValidationService,
    private readonly filesService: FilesService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);

    this.translocoService.langChanges$
      .pipe(
        untilDestroyed(this),
        tap(() => {
          this.formlyFields$.next(this.formlyFields$.value);
        })
      )
      .subscribe();

    this.ssoUserFormService
      .init()
      .pipe(
        mergeMap(() => {
          if (this.id) {
            return this.findOne().pipe(
              tap((result) =>
                this.afterFind.next({
                  ...result,
                })
              )
            );
          } else {
            this.setFieldsAndModel();
          }
          return of(true);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  setFieldsAndModel(model?: Partial<object>) {
    this.setFormlyFields();
    this.formlyModel$.next(model || null);
  }

  submitForm(): void {
    if (this.id) {
      this.updateOne()
        .pipe(
          tap((result) => {
            if (result) {
              this.nzMessageService.success(
                this.translocoService.translate('Success')
              );
              this.afterUpdate.next({
                ...result,
              });
            }
          }),
          untilDestroyed(this)
        )
        .subscribe();
    }
  }

  updateOne() {
    if (!this.id) {
      return throwError(
        () => new Error(this.translocoService.translate('id not set'))
      );
    }
    const data = this.ssoUserMapperService.toJson(this.form.value);
    const oldData = data;
    return (
      data.picture
        ? this.filesService.getPresignedUrlAndUploadFile(data.picture)
        : of('')
    ).pipe(
      mergeMap((picture) =>
        !this.id
          ? throwError(
              () => new Error(this.translocoService.translate('id not set'))
            )
          : this.ssoUserService.updateOne(this.id, { ...data, picture })
      ),
      mergeMap((newData) => {
        if (
          oldData.picture &&
          typeof oldData.picture === 'string' &&
          newData.picture !== oldData.picture
        ) {
          return this.filesService
            .deleteFile(oldData.picture)
            .pipe(map(() => newData));
        }
        return of(newData);
      }),
      catchError((err) =>
        this.validationService.catchAndProcessServerError(err, (options) =>
          this.setFormlyFields(options)
        )
      )
    );
  }

  findOne() {
    if (!this.id) {
      return throwError(
        () => new Error(this.translocoService.translate('id not set'))
      );
    }
    return this.ssoUserService.findOne(this.id).pipe(
      tap((result) => {
        this.setFieldsAndModel(this.ssoUserMapperService.toForm(result));
      })
    );
  }

  private setFormlyFields(options?: {
    errors?: ValidationErrorMetadataInterface[];
  }) {
    this.formlyFields$.next(this.ssoUserFormService.getFormlyFields(options));
  }
}
