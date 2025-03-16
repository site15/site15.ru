import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  SsoProjectScalarFieldEnumInterface,
  UpdateSsoProjectDtoInterface,
  ValidationErrorMetadataInterface,
} from '@nestjs-mod-sso/app-angular-rest-sdk';
import { ValidationService } from '@nestjs-mod-sso/common-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { of } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class SsoProjectFormService {
  constructor(
    protected readonly translocoService: TranslocoService,
    protected readonly validationService: ValidationService
  ) {}

  init() {
    return of(true);
  }

  getFormlyFields(options?: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data?: UpdateSsoProjectDtoInterface;
    errors?: ValidationErrorMetadataInterface[];
  }): FormlyFieldConfig[] {
    return this.validationService.appendServerErrorsAsValidatorsToFields(
      [
        {
          key: SsoProjectScalarFieldEnumInterface.name,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-project.form.fields.name`
            ),
            placeholder: 'name',
            required: true,
          },
        },
        {
          key: SsoProjectScalarFieldEnumInterface.clientId,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-project.form.fields.client-id`
            ),
            placeholder: 'clientId',
            required: true,
          },
        },
        {
          key: SsoProjectScalarFieldEnumInterface.clientSecret,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-project.form.fields.client-secret`
            ),
            placeholder: 'clientSecret',
            required: true,
          },
        },
      ],
      options?.errors || []
    );
  }
}
