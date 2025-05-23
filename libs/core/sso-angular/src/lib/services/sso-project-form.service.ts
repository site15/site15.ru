import { Injectable } from '@angular/core';
import { LangDefinition, TranslocoService } from '@jsverse/transloco';
import {
  SsoProjectScalarFieldEnumInterface,
  UpdateSsoProjectDtoInterface,
  ValidationErrorMetadataInterface,
} from '@nestjs-mod/sso-rest-sdk-angular';
import { ValidationService } from '@nestjs-mod/afat';
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
        ...this.getAvailableLangs().map((a) => ({
          key:
            a.id === this.translocoService.getDefaultLang()
              ? 'name'
              : `name_${a.id}`,
          type: 'textarea',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-project.form.fields.name-locale`,
              // id, label
              { locale: a.id, label: this.translocoService.translate(a.label) }
            ),
            placeholder:
              a.id === this.translocoService.getDefaultLang()
                ? 'name'
                : `name ${a.id}`,
            required: a.id === this.translocoService.getDefaultLang(),
          },
        })),
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
        {
          key: SsoProjectScalarFieldEnumInterface.public,
          type: 'checkbox',
          validation: {
            show: true,
          },
          defaultValue: false,
          props: {
            label: this.translocoService.translate(
              `sso-project.form.fields.public`
            ),
            placeholder: 'public',
            required: true,
          },
        },
      ],
      options?.errors || []
    );
  }

  private getAvailableLangs() {
    return this.translocoService.getAvailableLangs() as LangDefinition[];
  }
}
