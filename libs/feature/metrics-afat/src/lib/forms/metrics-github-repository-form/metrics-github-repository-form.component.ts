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
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ValidationService, ValidationErrorMetadataInterface } from '@nestjs-mod/afat';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject, catchError, distinctUntilChanged, mergeMap, of, tap, throwError } from 'rxjs';
import { MetricsGithubRepositoryFormService } from '../../services/metrics-github-repository-form.service';
import {
  MetricsGithubRepositoryMapperService,
  MetricsGithubRepositoryModel,
} from '../../services/metrics-github-repository-mapper.service';
import { MetricsGithubRepositoryService } from '../../services/metrics-github-repository.service';
import { compare } from '@nestjs-mod/misc';

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
  selector: 'metrics-github-repository-form',
  templateUrl: './metrics-github-repository-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MetricsGithubRepositoryFormComponent implements OnInit {
  @Input()
  id?: string;

  @Input()
  hideButtons?: boolean;

  @Output()
  afterFind = new EventEmitter<MetricsGithubRepositoryModel>();

  @Output()
  afterCreate = new EventEmitter<MetricsGithubRepositoryModel>();

  @Output()
  afterUpdate = new EventEmitter<MetricsGithubRepositoryModel>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);
  errors?: ValidationErrorMetadataInterface[];

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: MetricsGithubRepositoryFormComponent,
    private readonly metricsGithubRepositoryService: MetricsGithubRepositoryService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly metricsGithubRepositoryFormService: MetricsGithubRepositoryFormService,
    private readonly metricsGithubRepositoryMapperService: MetricsGithubRepositoryMapperService,
    private readonly validationService: ValidationService,
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);

    this.translocoService.langChanges$
      .pipe(
        untilDestroyed(this),
        tap(() => {
          this.formlyFields$.next(this.formlyFields$.value);
        }),
      )
      .subscribe();

    this.form.valueChanges
      .pipe(
        distinctUntilChanged((prev, cur) => compare(prev, cur).different.length === 0),
        tap(() => {
          if (this.errors?.length) {
            this.setFormlyFields({ errors: [] });
          }
        }),
        untilDestroyed(this),
      )
      .subscribe();

    this.metricsGithubRepositoryFormService
      .init()
      .pipe(
        mergeMap(() => {
          if (this.id) {
            return this.findOne().pipe(
              tap((result) =>
                this.afterFind.next({
                  ...result,
                }),
              ),
            );
          } else {
            this.setFieldsAndModel();
          }
          return of(true);
        }),
        untilDestroyed(this),
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
              this.nzMessageService.success(this.translocoService.translate('Success'));
              this.afterUpdate.next({
                ...result,
              });
            }
          }),
          untilDestroyed(this),
        )
        .subscribe();
    } else {
      this.createOne()
        .pipe(
          tap((result) => {
            if (result) {
              this.nzMessageService.success(this.translocoService.translate('Success'));
              this.afterCreate.next({
                ...result,
              });
            }
          }),

          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  createOne() {
    return this.metricsGithubRepositoryService
      .createOne(this.metricsGithubRepositoryMapperService.toJson(this.form.value))
      .pipe(
        catchError((err) =>
          this.validationService.catchAndProcessServerError(err, (options) => this.setFormlyFields(options)),
        ),
      );
  }

  updateOne() {
    if (!this.id) {
      return throwError(() => new Error(this.translocoService.translate('id not set')));
    }
    return this.metricsGithubRepositoryService
      .updateOne(this.id, this.metricsGithubRepositoryMapperService.toJson(this.form.value))
      .pipe(
        catchError((err) =>
          this.validationService.catchAndProcessServerError(err, (options) => this.setFormlyFields(options)),
        ),
      );
  }

  findOne() {
    if (!this.id) {
      return throwError(() => new Error(this.translocoService.translate('id not set')));
    }
    return this.metricsGithubRepositoryService.findOne(this.id).pipe(
      tap((result) => {
        this.setFieldsAndModel(this.metricsGithubRepositoryMapperService.toForm(result));
      }),
    );
  }

  private setFormlyFields(options?: { errors?: ValidationErrorMetadataInterface[] }) {
    this.formlyFields$.next(this.metricsGithubRepositoryFormService.getFormlyFields(options));
    this.errors = options?.errors || [];
  }
}
