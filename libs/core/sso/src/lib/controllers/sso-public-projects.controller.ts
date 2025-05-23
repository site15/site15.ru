import { FindManyArgs } from '@nestjs-mod/swagger';

import { PrismaToolsService } from '@nestjs-mod-sso/prisma-tools';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Prisma, PrismaClient } from '@prisma/sso-client';
import { isUUID } from 'class-validator';
import { SSO_FEATURE } from '../sso.constants';
import { FindManySsoPublicProjectResponse } from '../types/find-many-sso-public-project-response';
import { AllowEmptySsoUser } from '../sso.decorators';

@ApiTags('Sso')
@AllowEmptySsoUser()
@Controller('/sso/public-projects')
export class SsoPublicProjectsController {
  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManySsoPublicProjectResponse })
  async findMany(@Query() args: FindManyArgs) {
    const { take, skip, curPage, perPage } =
      this.prismaToolsService.getFirstSkipFromCurPerPage({
        curPage: args.curPage,
        perPage: args.perPage,
      });
    const searchText = args.searchText;

    const orderBy = (args.sort || 'name:asc')
      .split(',')
      .map((s) => s.split(':'))
      .reduce(
        (all, [key, value]) => ({
          ...all,
          ...(key in Prisma.SsoProjectScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {}
      );
    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        ssoPublicProjects: await prisma.ssoProject.findMany({
          select: {
            id: true,
            clientId: true,
            name: true,
            nameLocale: true,
            createdAt: true,
            updatedAt: true,
          },
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText)
                      ? [{ id: { equals: searchText } }]
                      : []),
                    {
                      clientId: { contains: searchText, mode: 'insensitive' },
                    },
                  ],
                }
              : {}),
            public: true,
          },
          take,
          skip,
          orderBy,
        }),
        totalResults: await prisma.ssoProject.count({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText)
                      ? [{ id: { equals: searchText } }]
                      : []),
                    {
                      clientId: { contains: searchText, mode: 'insensitive' },
                    },
                  ],
                }
              : {}),
            public: true,
          },
        }),
      };
    });
    return {
      ssoPublicProjects: result.ssoPublicProjects,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }
}
