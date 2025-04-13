import { Injectable } from '@nestjs/common';

import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaClient } from '@prisma/sso-client';
import { TranslatesService, TranslatesStorage } from 'nestjs-translates';
import { DEFAULT_EMAIL_TEMPLATES, SSO_FEATURE } from '../sso.constants';

@Injectable()
export class SsoTemplatesService {
  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly translatesService: TranslatesService,
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
              this.translatesService.translate(template.html, locale),
            ])
          ),
          subjectLocale: Object.fromEntries(
            locales.map((locale) => [
              locale,
              this.translatesService.translate(template.subject, locale),
            ])
          ),
          textLocale: Object.fromEntries(
            locales.map((locale) => [
              locale,
              this.translatesService.translate(template.text, locale),
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
              this.translatesService.translate(template.html, locale),
            ])
          ),
          subjectLocale: Object.fromEntries(
            locales.map((locale) => [
              locale,
              this.translatesService.translate(template.subject, locale),
            ])
          ),
          textLocale: Object.fromEntries(
            locales.map((locale) => [
              locale,
              this.translatesService.translate(template.text, locale),
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
