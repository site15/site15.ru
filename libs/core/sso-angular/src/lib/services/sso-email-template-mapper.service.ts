import { Injectable } from '@angular/core';
import { LangDefinition, TranslocoService } from '@jsverse/transloco';
import { TIMEZONE_OFFSET } from '@nestjs-mod/misc';
import { SsoEmailTemplateDtoInterface } from '@nestjs-mod/sso-rest-sdk-angular';
import { addHours } from 'date-fns';

export interface SsoEmailTemplateModel
  extends Partial<
    Omit<
      SsoEmailTemplateDtoInterface,
      | 'subjectLocale'
      | 'textLocale'
      | 'htmlLocale'
      | 'projectId'
      | 'createdAt'
      | 'updatedAt'
    >
  > {
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class SsoEmailTemplateMapperService {
  constructor(protected readonly translocoService: TranslocoService) {}

  private getAvailableLangs() {
    return this.translocoService.getAvailableLangs() as LangDefinition[];
  }

  toModel(item?: SsoEmailTemplateDtoInterface): SsoEmailTemplateModel {
    return {
      ...item,
      createdAt: item?.createdAt
        ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET)
        : null,
      updatedAt: item?.updatedAt
        ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET)
        : null,
      ...Object.fromEntries(
        this.getAvailableLangs().map((a) => {
          return [`subject_${a.id}`, item?.subjectLocale?.[a.id] || ''];
        })
      ),
      ...Object.fromEntries(
        this.getAvailableLangs().map((a) => {
          return [`html_${a.id}`, item?.htmlLocale?.[a.id] || ''];
        })
      ),
      ...Object.fromEntries(
        this.getAvailableLangs().map((a) => {
          return [`text_${a.id}`, item?.textLocale?.[a.id] || ''];
        })
      ),
    };
  }

  toForm(model: SsoEmailTemplateModel) {
    return {
      ...model,
    };
  }

  toJson(data: SsoEmailTemplateModel) {
    return {
      operationName: data.operationName || '',
      subject: data.subject || '',
      html: data.html || '',
      text: data.text || '',
      subjectLocale: Object.fromEntries(
        this.getAvailableLangs().map((a) => {
          return [a.id, data[`subject_${a.id}`] || ''];
        })
      ),
      htmlLocale: Object.fromEntries(
        this.getAvailableLangs().map((a) => {
          return [a.id, data[`html_${a.id}`] || ''];
        })
      ),
      textLocale: Object.fromEntries(
        this.getAvailableLangs().map((a) => {
          return [a.id, data[`text_${a.id}`] || ''];
        })
      ),
    };
  }
}
