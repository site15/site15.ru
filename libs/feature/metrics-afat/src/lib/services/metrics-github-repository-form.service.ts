import { Injectable } from '@angular/core';
import { LangDefinition, TranslocoService } from '@jsverse/transloco';
import { ValidationService } from '@nestjs-mod/afat';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';
import {
  MetricsGithubRepositoryScalarFieldEnumInterface,
  UpdateMetricsGithubRepositoryDtoInterface,
  ValidationErrorMetadataInterface,
} from '@site15/rest-sdk-angular';
import { of } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class MetricsGithubRepositoryFormService {
  constructor(
    protected readonly translocoService: TranslocoService,
    protected readonly validationService: ValidationService,
  ) {}

  init() {
    return of(true);
  }

  getFormlyFields(options?: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data?: UpdateMetricsGithubRepositoryDtoInterface;
    errors?: ValidationErrorMetadataInterface[];
  }): FormlyFieldConfig[] {
    return this.validationService.appendServerErrorsAsValidatorsToFields(
      [
        {
          key: MetricsGithubRepositoryScalarFieldEnumInterface.name,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-github-repository.form.fields.name`),
            placeholder: 'name',
            required: true,
          },
        },
        {
          key: MetricsGithubRepositoryScalarFieldEnumInterface.owner,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-github-repository.form.fields.owner`),
            placeholder: 'owner',
            required: true,
          },
        },
        {
          key: MetricsGithubRepositoryScalarFieldEnumInterface.private,
          type: 'checkbox',
          validation: {
            show: true,
          },
          defaultValue: false,
          props: {
            label: this.translocoService.translate(`metrics-github-repository.form.fields.private`),
            placeholder: 'private',
          },
        },
        {
          key: MetricsGithubRepositoryScalarFieldEnumInterface.fork,
          type: 'checkbox',
          validation: {
            show: true,
          },
          defaultValue: false,
          props: {
            label: this.translocoService.translate(`metrics-github-repository.form.fields.fork`),
            placeholder: 'fork',
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
