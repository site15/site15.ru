import { FindManyArgs } from '@nestjs-mod/swagger';

import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaToolsService } from '@nestjs-mod/prisma-tools';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { Prisma } from '../generated/prisma-client';
import { SSO_FEATURE } from '../sso.constants';
import { AllowEmptySsoUser } from '../sso.decorators';
import { SsoPrismaSdk } from '../sso.prisma-sdk';
import { FindManySsoPublicTenantResponse } from '../types/find-many-sso-public-tenant-response';

@ApiTags('Sso')
@AllowEmptySsoUser()
@Controller('/sso/public-tenants')
export class SsoPublicTenantsController {
  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: SsoPrismaSdk.PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManySsoPublicTenantResponse })
  async findMany(@Query() args: FindManyArgs) {
    const { take, skip, curPage, perPage } = this.prismaToolsService.getFirstSkipFromCurPerPage({
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
          ...(key in Prisma.SsoTenantScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {},
      );
    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        ssoPublicTenants: await prisma.ssoTenant.findMany({
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
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }] : []),
                    {
                      clientId: { contains: searchText, mode: 'insensitive' },
                    },
                  ],
                }
              : {}),
            public: true,
            enabled: true,
          },
          take,
          skip,
          orderBy,
        }),
        totalResults: await prisma.ssoTenant.count({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }] : []),
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
      ssoPublicTenants: result.ssoPublicTenants,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }
}
