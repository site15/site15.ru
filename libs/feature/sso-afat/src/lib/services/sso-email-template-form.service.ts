import { Injectable } from '@angular/core';
import { LangDefinition, TranslocoService } from '@jsverse/transloco';
import {
  SsoEmailTemplateScalarFieldEnumInterface,
  UpdateSsoEmailTemplateDtoInterface,
  ValidationErrorMetadataInterface,
} from '@nestjs-mod/sso-rest-sdk-angular';
import { ValidationService } from '@nestjs-mod/afat';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { of } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class SsoEmailTemplateFormService {
  constructor(
    protected readonly translocoService: TranslocoService,
    protected readonly validationService: ValidationService
  ) {}

  init() {
    return of(true);
  }

  getFormlyFields(options?: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data?: UpdateSsoEmailTemplateDtoInterface;
    errors?: ValidationErrorMetadataInterface[];
  }): FormlyFieldConfig[] {
    return this.validationService.appendServerErrorsAsValidatorsToFields(
      [
        {
          key: SsoEmailTemplateScalarFieldEnumInterface.operationName,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            readonly: true,
            disabled: true,
            label: this.translocoService.translate(
              `sso-email-template.form.fields.operation-name`
            ),
            placeholder: 'operationName',
          },
        },
        ...this.getAvailableLangs().map((a) => ({
          key:
            a.id === this.translocoService.getDefaultLang()
              ? 'subject'
              : `subject_${a.id}`,
          type: 'textarea',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-email-template.form.fields.subject-locale`,
              // id, label
              { locale: a.id, label: this.translocoService.translate(a.label) }
            ),
            placeholder:
              a.id === this.translocoService.getDefaultLang()
                ? 'subject'
                : `subject ${a.id}`,
            required: a.id === this.translocoService.getDefaultLang(),
          },
        })),
        ...this.getAvailableLangs().map((a) => ({
          key:
            a.id === this.translocoService.getDefaultLang()
              ? 'html'
              : `html_${a.id}`,
          type: 'textarea',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-email-template.form.fields.html-locale`,
              // id, label
              { locale: a.id, label: this.translocoService.translate(a.label) }
            ),
            placeholder:
              a.id === this.translocoService.getDefaultLang()
                ? 'html'
                : `html ${a.id}`,
            required: a.id === this.translocoService.getDefaultLang(),
          },
        })),
        ...this.getAvailableLangs().map((a) => ({
          key:
            a.id === this.translocoService.getDefaultLang()
              ? 'text'
              : `text_${a.id}`,
          type: 'textarea',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `sso-email-template.form.fields.text-locale`,
              // id, label
              { locale: a.id, label: this.translocoService.translate(a.label) }
            ),
            placeholder:
              a.id === this.translocoService.getDefaultLang()
                ? 'text'
                : `text ${a.id}`,
            required: a.id === this.translocoService.getDefaultLang(),
          },
        })),
      ],
      options?.errors || []
    );
  }

  private getAvailableLangs() {
    return this.translocoService.getAvailableLangs() as LangDefinition[];
  }
}
