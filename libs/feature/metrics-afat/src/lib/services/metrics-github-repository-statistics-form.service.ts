import { Injectable } from '@angular/core';
import { LangDefinition, TranslocoService } from '@jsverse/transloco';
import { ValidationService, ValidationErrorMetadataInterface } from '@nestjs-mod/afat';
import { MetricsGithubRepositoryStatisticsScalarFieldEnumInterface } from '@site15/rest-sdk-angular';

@Injectable({ providedIn: 'root' })
export class MetricsGithubRepositoryStatisticsFormService {
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
          key: MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.periodType,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-github-repository-statistics.form.fields.periodType`),
            placeholder: 'periodType',
            required: true,
          },
        },
        {
          key: MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.starsCount,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-github-repository-statistics.form.fields.starsCount`),
            placeholder: 'starsCount',
            required: false,
            type: 'number',
          },
        },
        {
          key: MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.forksCount,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-github-repository-statistics.form.fields.forksCount`),
            placeholder: 'forksCount',
            required: false,
            type: 'number',
          },
        },
        {
          key: MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.contributorsCount,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `metrics-github-repository-statistics.form.fields.contributorsCount`,
            ),
            placeholder: 'contributorsCount',
            required: false,
            type: 'number',
          },
        },
        {
          key: MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.commitsCount,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-github-repository-statistics.form.fields.commitsCount`),
            placeholder: 'commitsCount',
            required: false,
            type: 'number',
          },
        },
        {
          key: MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.lastCommitDate,
          type: 'date-input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-github-repository-statistics.form.fields.lastCommitDate`),
            placeholder: 'lastCommitDate',
            required: false,
          },
        },
        {
          key: MetricsGithubRepositoryStatisticsScalarFieldEnumInterface.recordedAt,
          type: 'date-input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-github-repository-statistics.form.fields.recordedAt`),
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
