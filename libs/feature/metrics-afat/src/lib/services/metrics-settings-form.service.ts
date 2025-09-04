import { Injectable } from '@angular/core';
import { LangDefinition, TranslocoService } from '@jsverse/transloco';
import { ValidationService, ValidationErrorMetadataInterface } from '@nestjs-mod/afat';
import { MetricsSettingsScalarFieldEnumInterface } from '@site15/rest-sdk-angular';

@Injectable({ providedIn: 'root' })
export class MetricsSettingsFormService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly translocoService: TranslocoService,
  ) {}

  async init() {
    const langIds = this.getAvailableLangs().map((lang) => lang.id);
    for (const langId of langIds) {
      await this.translocoService.load(langId).toPromise();
    }
  }

  getFormlyFields(options?: { errors?: ValidationErrorMetadataInterface[] }) {
    return this.validationService.appendServerErrorsAsValidatorsToFields(
      [
        {
          key: MetricsSettingsScalarFieldEnumInterface.enabled,
          type: 'checkbox',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-settings.form.fields.enabled`),
            placeholder: 'enabled',
          },
        },
        {
          key: MetricsSettingsScalarFieldEnumInterface.githubToken,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-settings.form.fields.github-token`),
            placeholder: 'githubToken',
          },
        },
      ],
      options?.errors || [],
    );
  }

  private getAvailableLangs() {
    return this.translocoService.getAvailableLangs() as LangDefinition[];
  }
}
