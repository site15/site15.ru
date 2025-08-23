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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { BehaviorSubject, catchError, distinctUntilChanged, tap, throwError } from 'rxjs';
import { MetricsGithubRepositoryStatisticsFormService } from '../../services/metrics-github-repository-statistics-form.service';
import {
  MetricsGithubRepositoryStatisticsMapperService,
  MetricsGithubRepositoryStatisticsModel,
} from '../../services/metrics-github-repository-statistics-mapper.service';
import { MetricsGithubRepositoryStatisticsService } from '../../services/metrics-github-repository-statistics.service';
import { compare } from '@nestjs-mod/misc';

@UntilDestroy()
@Component({
  imports: [
    FormlyModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzDatePickerModule,
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    TranslocoPipe,
  ],
  selector: 'metrics-github-repository-statistics-form',
  templateUrl: './metrics-github-repository-statistics-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MetricsGithubRepositoryStatisticsFormComponent implements OnInit {
  @Input()
  id?: string;

  @Input()
  hideButtons?: boolean;

  @Output()
  afterFind = new EventEmitter<MetricsGithubRepositoryStatisticsModel>();

  @Output()
  afterCreate = new EventEmitter<MetricsGithubRepositoryStatisticsModel>();

  @Output()
  afterUpdate = new EventEmitter<MetricsGithubRepositoryStatisticsModel>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);
  errors?: ValidationErrorMetadataInterface[];

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: MetricsGithubRepositoryStatisticsFormComponent,
    private readonly metricsGithubRepositoryStatisticsService: MetricsGithubRepositoryStatisticsService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly metricsGithubRepositoryStatisticsFormService: MetricsGithubRepositoryStatisticsFormService,
    private readonly metricsGithubRepositoryStatisticsMapperService: MetricsGithubRepositoryStatisticsMapperService,
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

    this.metricsGithubRepositoryStatisticsFormService.init().then(() => {
      if (this.id) {
        this.findOne()
          .pipe(
            tap((result) =>
              this.afterFind.next({
                ...result,
              }),
            ),
            untilDestroyed(this),
          )
          .subscribe();
      } else {
        this.setFieldsAndModel();
      }
    });
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

  private createOne() {
    return this.metricsGithubRepositoryStatisticsService
      .createOne(this.metricsGithubRepositoryStatisticsMapperService.toJson(this.form.value))
      .pipe(
        catchError((err) =>
          this.validationService.catchAndProcessServerError(err, (options) => this.setFormlyFields(options)),
        ),
      );
  }

  private updateOne() {
    if (!this.id) {
      return throwError(() => new Error(this.translocoService.translate('id not set')));
    }
    return this.metricsGithubRepositoryStatisticsService
      .updateOne(this.id, this.metricsGithubRepositoryStatisticsMapperService.toJson(this.form.value))
      .pipe(
        catchError((err) =>
          this.validationService.catchAndProcessServerError(err, (options) => this.setFormlyFields(options)),
        ),
      );
  }

  private findOne() {
    if (!this.id) {
      return throwError(() => new Error(this.translocoService.translate('id not set')));
    }
    return this.metricsGithubRepositoryStatisticsService.findOne(this.id).pipe(
      tap((result) => {
        this.setFieldsAndModel(this.metricsGithubRepositoryStatisticsMapperService.toForm(result));
      }),
    );
  }

  private setFormlyFields(options?: { errors?: ValidationErrorMetadataInterface[] }) {
    this.formlyFields$.next(this.metricsGithubRepositoryStatisticsFormService.getFormlyFields(options));
    this.errors = options?.errors || [];
  }
}
