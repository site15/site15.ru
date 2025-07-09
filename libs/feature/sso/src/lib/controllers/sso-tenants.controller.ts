import { FindManyArgs, StatusResponse } from '@nestjs-mod/swagger';

import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaToolsService } from '@nestjs-mod/prisma-tools';
import { ValidationError } from '@nestjs-mod/validation';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { CurrentLocale, SkipTranslate, TranslatesService } from 'nestjs-translates';
import { CreateSsoTenantDto } from '../generated/rest/dto/create-sso-tenant.dto';
import { SsoTenantDto } from '../generated/rest/dto/sso-tenant.dto';
import { UpdateSsoTenantDto } from '../generated/rest/dto/update-sso-tenant.dto';
import { Prisma, PrismaClient } from '../generated/prisma-client';
import { SsoCacheService } from '../services/sso-cache.service';
import { SsoTemplatesService } from '../services/sso-templates.service';
import { SSO_FEATURE } from '../sso.constants';
import { CheckSsoRole } from '../sso.decorators';
import { SsoError } from '../sso.errors';
import { FindManySsoTenantResponse } from '../types/find-many-sso-tenant-response';
import { SsoRole } from '../types/sso-role';

@ApiBadRequestResponse({
  schema: { allOf: refs(SsoError, ValidationError) },
})
@ApiTags('Sso')
@CheckSsoRole([SsoRole.admin])
@Controller('/sso/tenants')
@SkipTranslate()
export class SsoTenantsController {
  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly translatesService: TranslatesService,
    private readonly ssoCacheService: SsoCacheService,
    private readonly ssoTemplatesService: SsoTemplatesService,
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManySsoTenantResponse })
  async findMany(@Query() args: FindManyArgs) {
    const { take, skip, curPage, perPage } = this.prismaToolsService.getFirstSkipFromCurPerPage({
      curPage: args.curPage,
      perPage: args.perPage,
    });
    const searchText = args.searchText;

    const orderBy = (args.sort || 'createdAt:desc')
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
        ssoTenants: await prisma.ssoTenant.findMany({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }] : []),
                    {
                      clientId: { contains: searchText, mode: 'insensitive' },
                    },
                    {
                      slug: { contains: searchText, mode: 'insensitive' },
                    },
                    {
                      name: { contains: searchText, mode: 'insensitive' },
                    },
                  ],
                }
              : {}),
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
                    {
                      slug: { contains: searchText, mode: 'insensitive' },
                    },
                    {
                      name: { contains: searchText, mode: 'insensitive' },
                    },
                  ],
                }
              : {}),
          },
        }),
      };
    });
    return {
      ssoTenants: result.ssoTenants,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }

  @Post()
  @ApiCreatedResponse({ type: SsoTenantDto })
  async createOne(@Body() args: CreateSsoTenantDto) {
    const result = await this.prismaClient.ssoTenant.create({
      data: {
        ...args,
      },
    });

    await this.ssoTemplatesService.createTenantDefaultEmailTemplates(result.id);

    // fill cache
    await this.ssoCacheService.getCachedTenant(result.clientId);

    return result;
  }

  @Put(':id')
  @ApiOkResponse({ type: SsoTenantDto })
  async updateOne(@Param('id', new ParseUUIDPipe()) id: string, @Body() args: UpdateSsoTenantDto) {
    const result = await this.prismaClient.ssoTenant.update({
      data: { ...args, updatedAt: new Date() },
      where: {
        id,
      },
    });

    await this.ssoCacheService.clearCacheTenantByClientId(result.clientId);

    return result;
  }

  @Delete(':id')
  @ApiOkResponse({ type: StatusResponse })
  async deleteOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    // todo: change to InjectTranslateFunction, after write all posts
    @CurrentLocale() locale: string,
  ) {
    await this.prismaClient.ssoTenant.delete({
      where: {
        id,
      },
    });
    return { message: this.translatesService.translate('ok', locale) };
  }

  @Get(':id')
  @ApiOkResponse({ type: SsoTenantDto })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.prismaClient.ssoTenant.findFirstOrThrow({
      where: {
        id,
      },
    });
  }
}
