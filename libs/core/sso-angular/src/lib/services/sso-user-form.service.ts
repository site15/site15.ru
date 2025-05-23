import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { ValidationService } from '@nestjs-mod/afat';
import {
  SsoRestSdkAngularService,
  SsoUserScalarFieldEnumInterface,
  UpdateSsoUserDtoInterface,
  ValidationErrorMetadataInterface,
} from '@nestjs-mod/sso-rest-sdk-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { map, of } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class SsoUserFormService {
  private cachedRoles?: string[];

  constructor(
    protected readonly translocoService: TranslocoService,
    protected readonly validationService: ValidationService,
    protected readonly ssoRestSdkAngularService: SsoRestSdkAngularService
  ) {}

  init() {
    return of(true);
  }

  getRoles() {
    if (this.cachedRoles) {
      return of(this.cachedRoles);
    }
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoRolesControllerFindMany()
      .pipe(
        map((data) => {
          this.cachedRoles = data.userAvailableRoles;
          return this.cachedRoles;
        })
      );
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
          type: 'select',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-user.form.fields.gender`
            ),
            placeholder: 'gender',
            required: false,
            options: [
              {
                value: 'm',
                label: this.translocoService.translate('Male'),
              },
              {
                value: 'f',
                label: this.translocoService.translate('Female'),
              },
            ],
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
          type: 'select',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-user.form.fields.roles`
            ),
            placeholder: 'roles',
            required: false,
            multiple: true,
            options: this.getRoles().pipe(
              map((roles) =>
                roles.map((role) => ({
                  value: role,
                  label: role,
                }))
              )
            ),
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
