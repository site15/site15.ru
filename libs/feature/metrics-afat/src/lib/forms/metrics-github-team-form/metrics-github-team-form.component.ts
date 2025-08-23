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
import { BehaviorSubject, catchError, distinctUntilChanged, tap, throwError } from 'rxjs';
import { MetricsGithubTeamFormService } from '../../services/metrics-github-team-form.service';
import {
  MetricsGithubTeamMapperService,
  MetricsGithubTeamModel,
} from '../../services/metrics-github-team-mapper.service';
import { MetricsGithubTeamService } from '../../services/metrics-github-team.service';
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
  selector: 'metrics-github-team-form',
  templateUrl: './metrics-github-team-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MetricsGithubTeamFormComponent implements OnInit {
  @Input()
  id?: string;

  @Input()
  hideButtons?: boolean;

  @Output()
  afterFind = new EventEmitter<MetricsGithubTeamModel>();

  @Output()
  afterCreate = new EventEmitter<MetricsGithubTeamModel>();

  @Output()
  afterUpdate = new EventEmitter<MetricsGithubTeamModel>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);
  errors?: ValidationErrorMetadataInterface[];

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: MetricsGithubTeamFormComponent,
    private readonly metricsGithubTeamService: MetricsGithubTeamService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly metricsGithubTeamFormService: MetricsGithubTeamFormService,
    private readonly metricsGithubTeamMapperService: MetricsGithubTeamMapperService,
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

    this.metricsGithubTeamFormService.init().then(() => {
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
    return this.metricsGithubTeamService
      .createOne(this.metricsGithubTeamMapperService.toJson(this.form.value))
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
    return this.metricsGithubTeamService
      .updateOne(this.id, this.metricsGithubTeamMapperService.toJson(this.form.value))
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
    return this.metricsGithubTeamService.findOne(this.id).pipe(
      tap((result) => {
        this.setFieldsAndModel(this.metricsGithubTeamMapperService.toForm(result));
      }),
    );
  }

  private setFormlyFields(options?: { errors?: ValidationErrorMetadataInterface[] }) {
    this.formlyFields$.next(this.metricsGithubTeamFormService.getFormlyFields(options));
    this.errors = options?.errors || [];
  }
}
