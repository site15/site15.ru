import { Injectable } from '@angular/core';
import { LangDefinition, TranslocoService } from '@jsverse/transloco';
import { ValidationService, ValidationErrorMetadataInterface } from '@nestjs-mod/afat';
import { MetricsGithubUserStatisticsScalarFieldEnumInterface } from '@site15/rest-sdk-angular';

@Injectable({ providedIn: 'root' })
export class MetricsGithubUserStatisticsFormService {
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
          key: MetricsGithubUserStatisticsScalarFieldEnumInterface.periodType,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-github-user-statistics.form.fields.periodType`),
            placeholder: 'periodType',
            required: true,
          },
        },
        {
          key: MetricsGithubUserStatisticsScalarFieldEnumInterface.followersCount,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-github-user-statistics.form.fields.followersCount`),
            placeholder: 'followersCount',
            required: false,
            type: 'number',
          },
        },
        {
          key: MetricsGithubUserStatisticsScalarFieldEnumInterface.followingCount,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-github-user-statistics.form.fields.followingCount`),
            placeholder: 'followingCount',
            required: false,
            type: 'number',
          },
        },
        {
          key: MetricsGithubUserStatisticsScalarFieldEnumInterface.recordedAt,
          type: 'date-input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-github-user-statistics.form.fields.recordedAt`),
            placeholder: 'recordedAt',
            required: true,
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
