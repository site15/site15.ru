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
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
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
import { SsoSignUpFormService } from '../../services/auth-sign-up-form.service';
import { SsoSignUpMapperService } from '../../services/auth-sign-up-mapper.service';
import { SsoService } from '../../services/auth.service';
import { SsoSignupInput, SsoUserAndTokens } from '../../services/auth.types';

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
    TranslocoDirective,
  ],
  styles: [
    `
      :host {
        width: 400px;
      }
    `,
  ],
  selector: 'sso-sign-up-form',
  templateUrl: './auth-sign-up-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SsoSignUpFormComponent implements OnInit {
  @Input()
  hideButtons?: boolean;

  @Output()
  afterSignUp = new EventEmitter<SsoUserAndTokens>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: SsoSignUpFormComponent,
    private readonly authService: SsoService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly authSignUpFormService: SsoSignUpFormService,
    private readonly authSignUpMapperService: SsoSignUpMapperService,
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

    this.setFieldsAndModel({ password: '', confirmPassword: '' });
  }

  setFieldsAndModel(
    data: SsoSignupInput = { password: '', confirmPassword: '' }
  ) {
    const model = this.authSignUpMapperService.toModel(data);
    this.setFormlyFields({ data: model });
    this.formlyModel$.next(model);
  }

  submitForm(): void {
    if (this.form.valid) {
      const value = this.authSignUpMapperService.toJson(this.form.value);
      this.authService
        .signUp({ ...value })
        .pipe(
          tap((result) => {
            if (result.tokens) {
              this.afterSignUp.next(result);
              this.nzMessageService.success(
                this.translocoService.translate('Success')
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
    data?: SsoSignupInput;
    errors?: ValidationErrorMetadataInterface[];
  }) {
    this.formlyFields$.next(
      this.authSignUpFormService.getFormlyFields(options)
    );
  }
}
