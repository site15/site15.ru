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
  mergeMap,
  of,
  tap,
  throwError,
} from 'rxjs';
import { SsoEmailTemplateFormService } from '../../services/sso-email-template-form.service';
import {
  SsoEmailTemplateMapperService,
  SsoEmailTemplateModel,
} from '../../services/sso-email-template-mapper.service';
import { SsoEmailTemplateService } from '../../services/sso-email-template.service';

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
  selector: 'sso-email-template-form',
  templateUrl: './sso-email-template-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SsoEmailTemplateFormComponent implements OnInit {
  @Input()
  id?: string;

  @Input()
  hideButtons?: boolean;

  @Output()
  afterFind = new EventEmitter<SsoEmailTemplateModel>();

  @Output()
  afterCreate = new EventEmitter<SsoEmailTemplateModel>();

  @Output()
  afterUpdate = new EventEmitter<SsoEmailTemplateModel>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: SsoEmailTemplateFormComponent,
    private readonly ssoEmailTemplateService: SsoEmailTemplateService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly ssoEmailTemplateFormService: SsoEmailTemplateFormService,
    private readonly ssoEmailTemplateMapperService: SsoEmailTemplateMapperService,
    private readonly validationService: ValidationService
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

    this.ssoEmailTemplateFormService
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
    return this.ssoEmailTemplateService
      .updateOne(
        this.id,
        this.ssoEmailTemplateMapperService.toJson(this.form.value)
      )
      .pipe(
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
    return this.ssoEmailTemplateService.findOne(this.id).pipe(
      tap((result) => {
        this.setFieldsAndModel(
          this.ssoEmailTemplateMapperService.toForm(result)
        );
      })
    );
  }

  private setFormlyFields(options?: {
    errors?: ValidationErrorMetadataInterface[];
  }) {
    this.formlyFields$.next(
      this.ssoEmailTemplateFormService.getFormlyFields(options)
    );
  }
}
