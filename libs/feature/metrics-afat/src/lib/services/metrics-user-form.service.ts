import { Injectable } from '@angular/core';
import { LangDefinition, TranslocoService } from '@jsverse/transloco';
import { ValidationService, ValidationErrorMetadataInterface } from '@nestjs-mod/afat';
import { MetricsUserScalarFieldEnumInterface } from '@site15/rest-sdk-angular';

@Injectable({ providedIn: 'root' })
export class MetricsUserFormService {
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
          key: MetricsUserScalarFieldEnumInterface.externalUserId,
          type: 'input',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-user.form.fields.external-user-id`),
            placeholder: 'externalUserId',
            required: true,
          },
        },
        {
          key: MetricsUserScalarFieldEnumInterface.userRole,
          type: 'select',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(`metrics-user.form.fields.user-role`),
            placeholder: 'userRole',
            required: true,
            options: [
              { value: 'User', label: this.translocoService.translate('metrics-user.form.roles.user') },
              { value: 'Admin', label: this.translocoService.translate('metrics-user.form.roles.admin') },
            ],
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
