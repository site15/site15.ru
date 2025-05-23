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
import {
  SsoUserScalarFieldEnumInterface,
  ValidationErrorMetadataInterface,
} from '@nestjs-mod/sso-rest-sdk-angular';
import { ValidationService } from '@nestjs-mod/afat';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject, catchError, tap } from 'rxjs';
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
  selector: 'sso-invite-members-form',
  templateUrl: './sso-invite-members-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SsoInviteMembersFormComponent implements OnInit {
  @Input()
  hideButtons?: boolean;

  @Output()
  afterSendInvitationLinks = new EventEmitter<string>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: SsoInviteMembersFormComponent,
    private readonly ssoUserService: SsoUserService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
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

    this.setFieldsAndModel();
  }

  setFieldsAndModel(model?: Partial<object>) {
    this.setFormlyFields();
    this.formlyModel$.next(model || null);
  }

  submitForm(): void {
    this.ssoUserService
      .sendInvitationLinks(this.form.value)
      .pipe(
        catchError((err) =>
          this.validationService.catchAndProcessServerError(err, (options) =>
            this.setFormlyFields(options)
          )
        ),
        tap((result) => {
          if (result) {
            this.nzMessageService.success(
              this.translocoService.translate('Success')
            );
            this.afterSendInvitationLinks.next(
              this.formlyModel$.value?.['emails'] || ''
            );
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private setFormlyFields(options?: {
    errors?: ValidationErrorMetadataInterface[];
  }) {
    this.formlyFields$.next(
      this.validationService.appendServerErrorsAsValidatorsToFields(
        [
          {
            key: 'emails',
            type: 'input',
            validation: {
              show: true,
            },
            props: {
              label: this.translocoService.translate(
                `sso-invite-members.form.fields.emails`
              ),
              placeholder: 'emails',
              required: true,
            },
          },
        ],
        options?.errors || []
      )
    );
  }
}
