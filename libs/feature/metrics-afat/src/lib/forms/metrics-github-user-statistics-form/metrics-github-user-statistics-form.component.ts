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
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { BehaviorSubject, catchError, distinctUntilChanged, tap, throwError } from 'rxjs';
import { MetricsGithubUserStatisticsFormService } from '../../services/metrics-github-user-statistics-form.service';
import {
  MetricsGithubUserStatisticsMapperService,
  MetricsGithubUserStatisticsModel,
} from '../../services/metrics-github-user-statistics-mapper.service';
import { MetricsGithubUserStatisticsService } from '../../services/metrics-github-user-statistics.service';
import { compare } from '@nestjs-mod/misc';

@UntilDestroy()
@Component({
  imports: [
    FormlyModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzDatePickerModule,
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    TranslocoPipe,
  ],
  selector: 'metrics-github-user-statistics-form',
  templateUrl: './metrics-github-user-statistics-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MetricsGithubUserStatisticsFormComponent implements OnInit {
  @Input()
  id?: string;

  @Input()
  hideButtons?: boolean;

  @Output()
  afterFind = new EventEmitter<MetricsGithubUserStatisticsModel>();

  @Output()
  afterCreate = new EventEmitter<MetricsGithubUserStatisticsModel>();

  @Output()
  afterUpdate = new EventEmitter<MetricsGithubUserStatisticsModel>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);
  errors?: ValidationErrorMetadataInterface[];

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: MetricsGithubUserStatisticsFormComponent,
    private readonly metricsGithubUserStatisticsService: MetricsGithubUserStatisticsService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly metricsGithubUserStatisticsFormService: MetricsGithubUserStatisticsFormService,
    private readonly metricsGithubUserStatisticsMapperService: MetricsGithubUserStatisticsMapperService,
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

    this.metricsGithubUserStatisticsFormService.init().then(() => {
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
    return this.metricsGithubUserStatisticsService
      .createOne(this.metricsGithubUserStatisticsMapperService.toJson(this.form.value))
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
    return this.metricsGithubUserStatisticsService
      .updateOne(this.id, this.metricsGithubUserStatisticsMapperService.toJson(this.form.value))
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
    return this.metricsGithubUserStatisticsService.findOne(this.id).pipe(
      tap((result) => {
        this.setFieldsAndModel(this.metricsGithubUserStatisticsMapperService.toForm(result));
      }),
    );
  }

  private setFormlyFields(options?: { errors?: ValidationErrorMetadataInterface[] }) {
    this.formlyFields$.next(this.metricsGithubUserStatisticsFormService.getFormlyFields(options));
    this.errors = options?.errors || [];
  }
}
