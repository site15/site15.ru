import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  SsoUserScalarFieldEnumInterface,
  UpdateSsoUserDtoInterface,
  ValidationErrorMetadataInterface,
} from '@nestjs-mod-sso/app-angular-rest-sdk';
import { ValidationService } from '@nestjs-mod-sso/common-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { of } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class SsoUserFormService {
  constructor(
    protected readonly translocoService: TranslocoService,
    protected readonly validationService: ValidationService
  ) {}

  init() {
    return of(true);
  }

  getFormlyFields(options?: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data?: UpdateSsoUserDtoInterface;
    errors?: ValidationErrorMetadataInterface[];
  }): FormlyFieldConfig[] {
    return this.validationService.appendServerErrorsAsValidatorsToFields(
      [
        {
          key: SsoUserScalarFieldEnumInterface.appData,
          type: 'textarea',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-user.form.fields.app-data`
            ),
            placeholder: 'appData',
            required: false,
          },
        },
        {
          key: SsoUserScalarFieldEnumInterface.birthdate,
          type: 'date-input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-user.form.fields.birthdate`
            ),
            placeholder: 'birthdate',
            required: false,
          },
        },
        {
          key: SsoUserScalarFieldEnumInterface.email,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-user.form.fields.email`
            ),
            placeholder: 'email',
            required: true,
          },
        },
        {
          key: SsoUserScalarFieldEnumInterface.emailVerifiedAt,
          type: 'date-input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-user.form.fields.email-verified-at`
            ),
            placeholder: 'emailVerifiedAt',
            required: false,
          },
        },
        {
          key: SsoUserScalarFieldEnumInterface.firstname,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-user.form.fields.firstname`
            ),
            placeholder: 'firstname',
            required: false,
          },
        },
        {
          key: SsoUserScalarFieldEnumInterface.gender,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-user.form.fields.gender`
            ),
            placeholder: 'gender',
            required: false,
          },
        },
        {
          key: SsoUserScalarFieldEnumInterface.lastname,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-user.form.fields.lastname`
            ),
            placeholder: 'lastname',
            required: false,
          },
        },
        {
          key: SsoUserScalarFieldEnumInterface.phone,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-user.form.fields.phone`
            ),
            placeholder: 'phone',
            required: false,
          },
        },
        {
          key: SsoUserScalarFieldEnumInterface.phoneVerifiedAt,
          type: 'date-input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-user.form.fields.phone-verified-at`
            ),
            placeholder: 'phoneVerifiedAt',
            required: false,
          },
        },
        {
          key: SsoUserScalarFieldEnumInterface.picture,
          type: 'image-file',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-user.form.fields.picture`
            ),
            placeholder: 'picture',
            required: false,
          },
        },
        {
          key: SsoUserScalarFieldEnumInterface.revokedAt,
          type: 'date-input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-user.form.fields.revoked-at`
            ),
            placeholder: 'revokedAt',
            required: false,
          },
        },
        {
          key: SsoUserScalarFieldEnumInterface.roles,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-user.form.fields.roles`
            ),
            placeholder: 'roles',
            required: false,
          },
        },
        {
          key: SsoUserScalarFieldEnumInterface.username,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-user.form.fields.username`
            ),
            placeholder: 'username',
            required: false,
          },
        },
      ],
      options?.errors || []
    );
  }
}
