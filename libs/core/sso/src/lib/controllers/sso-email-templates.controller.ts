import { FindManyArgs } from '@nestjs-mod/swagger';

import { searchIn } from '@nestjs-mod/misc';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaToolsService } from '@nestjs-mod/prisma-tools';
import { ValidationError } from '@nestjs-mod/validation';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { omit } from 'lodash/fp';
import { SkipTranslate } from 'nestjs-translates';
import { SsoEmailTemplateDto } from '../generated/rest/dto/sso-email-template.dto';
import { UpdateSsoEmailTemplateDto } from '../generated/rest/dto/update-sso-email-template.dto';
import { Prisma, PrismaClient } from '../generated/prisma-client';
import { SSO_FEATURE } from '../sso.constants';
import { CurrentSsoRequest } from '../sso.decorators';
import { SsoError } from '../sso.errors';
import { FindManySsoEmailTemplateResponse } from '../types/find-many-sso-email-template-response';
import { SsoRequest } from '../types/sso-request';
import { SsoRole } from '../types/sso-role';

@ApiBadRequestResponse({
  schema: { allOf: refs(SsoError, ValidationError) },
})
@ApiTags('Sso')
@Controller('/sso/email-templates')
@SkipTranslate()
export class SsoEmailTemplatesController {
  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManySsoEmailTemplateResponse })
  async findMany(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Query() args: FindManyArgs
  ) {
    const { take, skip, curPage, perPage } =
      this.prismaToolsService.getFirstSkipFromCurPerPage({
        curPage: args.curPage,
        perPage: args.perPage,
      });

    const searchText = args.searchText;
    const projectId = ssoRequest.ssoProject.id;

    const orderBy = (args.sort || 'createdAt:desc')
      .split(',')
      .map((s) => s.split(':'))
      .reduce(
        (all, [key, value]) => ({
          ...all,
          ...(key in Prisma.SsoEmailTemplateScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {}
      );
    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        ssoEmailTemplates: await prisma.ssoEmailTemplate.findMany({
          where: {
            ...(projectId ? { projectId: { equals: projectId } } : {}),
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText)
                      ? [{ id: { equals: searchText } }]
                      : []),
                    {
                      html: { contains: searchText, mode: 'insensitive' },
                    },
                    {
                      operationName: {
                        contains: searchText,
                        mode: 'insensitive',
                      },
                    },
                    {
                      subject: { contains: searchText, mode: 'insensitive' },
                    },
                    {
                      text: { contains: searchText, mode: 'insensitive' },
                    },
                    {
                      htmlLocale: {
                        string_contains: searchText,
                      },
                    },
                    {
                      subjectLocale: {
                        string_contains: searchText,
                      },
                    },
                    {
                      textLocale: {
                        string_contains: searchText,
                      },
                    },
                  ],
                }
              : {}),
          },
          take,
          skip,
          orderBy,
        }),
        totalResults: await prisma.ssoEmailTemplate.count({
          where: {
            ...(projectId ? { projectId: { equals: projectId } } : {}),
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText)
                      ? [{ id: { equals: searchText } }]
                      : []),
                    {
                      html: { contains: searchText, mode: 'insensitive' },
                    },
                    {
                      operationName: {
                        contains: searchText,
                        mode: 'insensitive',
                      },
                    },
                    {
                      subject: { contains: searchText, mode: 'insensitive' },
                    },
                    {
                      text: { contains: searchText, mode: 'insensitive' },
                    },
                    {
                      htmlLocale: {
                        string_contains: searchText,
                      },
                    },
                    {
                      subjectLocale: {
                        string_contains: searchText,
                      },
                    },
                    {
                      textLocale: {
                        string_contains: searchText,
                      },
                    },
                  ],
                }
              : {}),
          },
        }),
      };
    });
    return {
      ssoEmailTemplates: result.ssoEmailTemplates,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }

  @Put(':id')
  @ApiOkResponse({ type: SsoEmailTemplateDto })
  async updateOne(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateSsoEmailTemplateDto
  ) {
    const projectId = searchIn(SsoRole.admin, ssoRequest.ssoUser?.roles)
      ? undefined
      : ssoRequest.ssoProject.id;

    const result = await this.prismaClient.ssoEmailTemplate.update({
      data: { ...omit(['operationName'], args), updatedAt: new Date() },
      where: {
        ...(projectId ? { projectId: { equals: projectId } } : {}),
        id,
      },
    });

    return result;
  }

  @Get(':id')
  @ApiOkResponse({ type: SsoEmailTemplateDto })
  async findOne(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    const projectId = searchIn(SsoRole.admin, ssoRequest.ssoUser?.roles)
      ? undefined
      : ssoRequest.ssoProject.id;

    return await this.prismaClient.ssoEmailTemplate.findFirstOrThrow({
      where: {
        ...(projectId ? { projectId: { equals: projectId } } : {}),
        id,
      },
    });
  }
}
