import { Injectable } from '@nestjs/common';

import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { TranslatesStorage } from 'nestjs-translates';
import { PrismaClient } from '../generated/prisma-client';
import { DEFAULT_EMAIL_TEMPLATES, SSO_FEATURE } from '../sso.constants';

@Injectable()
export class SsoTemplatesService {
  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly translatesStorage: TranslatesStorage
  ) {}

  async getEmailTemplate(options: {
    projectId: string;
    operationName: string;
  }) {
    return this.prismaClient.ssoEmailTemplate.findFirst({
      where: {
        projectId: { equals: options.projectId },
        operationName: { equals: options.operationName },
      },
    });
  }

  // todo: need create project level handler for recreate or reset to default email templates
  async createProjectDefaultEmailTemplates(projectId: string) {
    const locales = this.translatesStorage.locales.filter(
      (l) => l !== this.translatesStorage.defaultLocale
    );
    for (const template of DEFAULT_EMAIL_TEMPLATES) {
      await this.prismaClient.ssoEmailTemplate.upsert({
        create: {
          html: template.html,
          projectId,
          subject: template.subject,
          text: template.text,
          operationName: template.operationName,
          htmlLocale: Object.fromEntries(
            locales.map((locale) => [
              locale,
              this.translatesStorage.translates[locale]?.[template.html] ||
                template.html,
            ])
          ),
          subjectLocale: Object.fromEntries(
            locales.map((locale) => [
              locale,
              this.translatesStorage.translates[locale]?.[template.subject] ||
                template.subject,
            ])
          ),
          textLocale: Object.fromEntries(
            locales.map((locale) => [
              locale,
              this.translatesStorage.translates[locale]?.[template.text] ||
                template.text,
            ])
          ),
        },
        update: {
          html: template.html,
          subject: template.subject,
          text: template.text,
          htmlLocale: Object.fromEntries(
            locales.map((locale) => [
              locale,
              this.translatesStorage.translates[locale]?.[template.html] ||
                template.html,
            ])
          ),
          subjectLocale: Object.fromEntries(
            locales.map((locale) => [
              locale,
              this.translatesStorage.translates[locale]?.[template.subject] ||
                template.subject,
            ])
          ),
          textLocale: Object.fromEntries(
            locales.map((locale) => [
              locale,
              this.translatesStorage.translates[locale]?.[template.text] ||
                template.text,
            ])
          ),
        },
        where: {
          projectId_operationName: {
            projectId,
            operationName: template.operationName,
          },
        },
      });
    }
  }
}
