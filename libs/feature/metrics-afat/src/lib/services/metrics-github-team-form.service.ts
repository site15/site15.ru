import { Injectable } from '@angular/core';
import { LangDefinition, TranslocoService } from '@jsverse/transloco';
import { ValidationService, ValidationErrorMetadataInterface } from '@nestjs-mod/afat';
import { MetricsGithubTeamScalarFieldEnumInterface } from '@site15/rest-sdk-angular';

@Injectable({ providedIn: 'root' })
export class MetricsGithubTeamFormService {
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
          key: MetricsGithubTeamScalarFieldEnumInterface.name,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-github-team.form.fields.name`),
            placeholder: 'name',
            required: true,
          },
        },
        {
          key: MetricsGithubTeamScalarFieldEnumInterface.description,
          type: 'textarea',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-github-team.form.fields.description`),
            placeholder: 'description',
            required: false,
            rows: 4,
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
