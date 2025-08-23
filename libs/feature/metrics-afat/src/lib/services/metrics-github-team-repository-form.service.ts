import { Injectable } from '@angular/core';
import { LangDefinition, TranslocoService } from '@jsverse/transloco';
import { ValidationService, ValidationErrorMetadataInterface } from '@nestjs-mod/afat';
import { MetricsGithubTeamRepositoryScalarFieldEnumInterface } from '@site15/rest-sdk-angular';

@Injectable({ providedIn: 'root' })
export class MetricsGithubTeamRepositoryFormService {
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
          key: MetricsGithubTeamRepositoryScalarFieldEnumInterface.teamId,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-github-team-repository.form.fields.teamId`),
            placeholder: 'teamId',
            required: true,
          },
        },
        {
          key: MetricsGithubTeamRepositoryScalarFieldEnumInterface.repositoryId,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-github-team-repository.form.fields.repositoryId`),
            placeholder: 'repositoryId',
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
