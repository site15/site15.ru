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
import { RouterModule } from '@angular/router';
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
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { SsoCompleteForgotPasswordFormService } from '../../services/auth-complete-forgot-password-form.service';
import { SsoService } from '../../services/auth.service';
import {
  SsoCompleteForgotPasswordInput,
  SsoUserAndTokens,
} from '../../services/auth.types';

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
    RouterModule,
    TranslocoPipe,
  ],
  styles: [
    `
      :host {
        width: 400px;
      }
    `,
  ],
  selector: 'sso-complete-forgot-password-form',
  templateUrl: './auth-complete-forgot-password-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SsoCompleteForgotPasswordFormComponent implements OnInit {
  @Input()
  hideButtons?: boolean;
  @Input()
  submitButtonTitle?: string;

  @Input({ required: true })
  code!: string;

  @Output()
  afterCompleteForgotPassword = new EventEmitter<SsoUserAndTokens>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: SsoCompleteForgotPasswordFormComponent,
    private readonly authService: SsoService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly authCompleteForgotPasswordFormService: SsoCompleteForgotPasswordFormService,
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

    this.setFieldsAndModel({
      code: '',
      password: '',
      confirmPassword: '',
    });
  }

  setFieldsAndModel(
    data: SsoCompleteForgotPasswordInput = {
      code: '',
      password: '',
      confirmPassword: '',
    }
  ) {
    const model = {
      code: this.code,
      password: data.password,
      confirmPassword: data.confirmPassword,
    };
    this.setFormlyFields({ data: model });
    this.formlyModel$.next(model);
  }

  submitForm(): void {
    if (this.form.valid) {
      const value = this.form.value;
      this.authService
        .completeForgotPassword({ ...value, code: this.code })
        .pipe(
          tap((result) => {
            if (result) {
              this.afterCompleteForgotPassword.next(result);
              this.nzMessageService.success(
                this.translocoService.translate(
                  'Your password has been successfully changed!'
                )
              );
            }
          }),
          catchError((err) =>
            this.validationService.catchAndProcessServerError(err, (options) =>
              this.setFormlyFields(options)
            )
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          catchError((err: any) => {
            console.error(err);
            this.nzMessageService.error(
              this.translocoService.translate(err.error?.message || err.message)
            );
            return of(null);
          }),
          untilDestroyed(this)
        )
        .subscribe();
    } else {
      console.log(this.form.controls);
      this.nzMessageService.warning(
        this.translocoService.translate('Validation errors')
      );
    }
  }

  private setFormlyFields(options?: {
    data?: SsoCompleteForgotPasswordInput;
    errors?: ValidationErrorMetadataInterface[];
  }) {
    this.formlyFields$.next(
      this.authCompleteForgotPasswordFormService.getFormlyFields(options)
    );
  }
}
