import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  SsoRefreshSessionScalarFieldEnumInterface,
  UpdateSsoRefreshSessionDtoInterface,
  ValidationErrorMetadataInterface,
} from '@nestjs-mod/sso-rest-sdk-angular';
import { ValidationService } from '@nestjs-mod/afat';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { of } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class SsoSessionFormService {
  constructor(
    protected readonly translocoService: TranslocoService,
    protected readonly validationService: ValidationService
  ) {}

  init() {
    return of(true);
  }

  getFormlyFields(options?: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data?: UpdateSsoRefreshSessionDtoInterface;
    errors?: ValidationErrorMetadataInterface[];
  }): FormlyFieldConfig[] {
    return this.validationService.appendServerErrorsAsValidatorsToFields(
      [
        {
          key: SsoRefreshSessionScalarFieldEnumInterface.enabled,
          type: 'checkbox',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-session.form.fields.enabled`
            ),
            placeholder: 'enabled',
            required: true,
          },
        },
        {
          key: SsoRefreshSessionScalarFieldEnumInterface.expiresAt,
          type: 'date-input',
          validation: {
            show: true,
          },
          props: {
            type: 'number',
            label: this.translocoService.translate(
              `sso-session.form.fields.expires-at`
            ),
            placeholder: 'expiresAt',
            required: false,
          },
        },
        {
          key: SsoRefreshSessionScalarFieldEnumInterface.fingerprint,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-session.form.fields.fingerprint`
            ),
            placeholder: 'fingerprint',
            required: false,
          },
        },
        {
          key: SsoRefreshSessionScalarFieldEnumInterface.userAgent,
          type: 'textarea',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-session.form.fields.user-agent`
            ),
            placeholder: 'userAgent',
            required: false,
          },
        },
        {
          key: SsoRefreshSessionScalarFieldEnumInterface.userData,
          type: 'textarea',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-session.form.fields.user-data`
            ),
            placeholder: 'userData',
            required: false,
          },
        },
        {
          key: SsoRefreshSessionScalarFieldEnumInterface.userIp,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-session.form.fields.user-ip`
            ),
            placeholder: 'userIp',
            required: false,
          },
        },
      ],
      options?.errors || []
    );
  }
}
