import { searchIn } from '@nestjs-mod/misc';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaToolsService } from '@nestjs-mod/prisma-tools';
import { ValidationError } from '@nestjs-mod/validation';
import { Body, Controller, Get, Param, ParseUUIDPipe, Put, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { Prisma } from '../generated/prisma-client';
import { SsoRefreshSessionDto } from '../generated/rest/dto/sso-refresh-session.dto';
import { UpdateSsoRefreshSessionDto } from '../generated/rest/dto/update-sso-refresh-session.dto';
import { SsoCacheService } from '../services/sso-cache.service';
import { SSO_API_TAG, SSO_FEATURE, SSO_SESSIONS_CONTROLLER_PATH } from '../sso.constants';
import { CurrentSsoRequest } from '../sso.decorators';
import { SsoError } from '../sso.errors';
import { SsoPrismaSdk } from '../sso.prisma-sdk';
import { FindManySsoRefreshSessionArgs } from '../types/find-many-sso-refresh-session-args';
import { FindManySsoRefreshSessionResponse } from '../types/find-many-sso-refresh-session-response';
import { SsoRequest } from '../types/sso-request';
import { SsoRole } from '../types/sso-role';

@ApiBadRequestResponse({
  schema: { allOf: refs(SsoError, ValidationError) },
})
@ApiTags(SSO_API_TAG)
@Controller(SSO_SESSIONS_CONTROLLER_PATH)
export class SsoRefreshSessionsController {
  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: SsoPrismaSdk.PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly ssoCacheService: SsoCacheService,
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManySsoRefreshSessionResponse })
  async findMany(@CurrentSsoRequest() ssoRequest: SsoRequest, @Query() args: FindManySsoRefreshSessionArgs) {
    const tenantId = ssoRequest.ssoTenant.id;
    const { take, skip, curPage, perPage } = this.prismaToolsService.getFirstSkipFromCurPerPage({
      curPage: args.curPage,
      perPage: args.perPage,
    });
    const searchText = args.searchText;
    const userId = args.userId;

    const orderBy = (args.sort || 'createdAt:desc')
      .split(',')
      .map((s) => s.split(':'))
      .reduce(
        (all, [key, value]) => ({
          ...all,
          ...(key in Prisma.SsoRefreshSessionScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {},
      );
    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        ssoRefreshSessions: await prisma.ssoRefreshSession.findMany({
          where: {
            enabled: true,
            // ...(tenantId ? { tenantId } : {}),
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }] : []),
                    {
                      userIp: { contains: searchText, mode: 'insensitive' },
                    },
                    {
                      fingerprint: {
                        contains: searchText,
                        mode: 'insensitive',
                      },
                    },
                    {
                      userAgent: { contains: searchText, mode: 'insensitive' },
                    },
                  ],
                }
              : {}),
            userId: { equals: userId },
          },
          take,
          skip,
          orderBy,
        }),
        totalResults: await prisma.ssoRefreshSession.count({
          where: {
            enabled: true,
            // ...(tenantId ? { tenantId } : {}),
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }] : []),
                    {
                      userIp: { contains: searchText, mode: 'insensitive' },
                    },
                    {
                      fingerprint: {
                        contains: searchText,
                        mode: 'insensitive',
                      },
                    },
                    {
                      userAgent: { contains: searchText, mode: 'insensitive' },
                    },
                  ],
                }
              : {}),
            userId: { equals: userId },
          },
        }),
      };
    });
    return {
      ssoRefreshSessions: result.ssoRefreshSessions,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }

  @Put(':id')
  @ApiOkResponse({ type: SsoRefreshSessionDto })
  async updateOne(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateSsoRefreshSessionDto,
  ) {
    const tenantId = searchIn(SsoRole.admin, ssoRequest.ssoUser?.roles) ? undefined : ssoRequest.ssoTenant.id;
    const result = await this.prismaClient.ssoRefreshSession.update({
      data: { ...args, updatedAt: new Date() },
      where: {
        ...(tenantId ? { tenantId } : {}),
        id,
      },
    });

    await this.ssoCacheService.clearCacheByRefreshSession(result.refreshToken);

    return result;
  }

  @Get(':id')
  @ApiOkResponse({ type: SsoRefreshSessionDto })
  async findOne(@CurrentSsoRequest() ssoRequest: SsoRequest, @Param('id', new ParseUUIDPipe()) id: string) {
    const tenantId = searchIn(SsoRole.admin, ssoRequest.ssoUser?.roles) ? undefined : ssoRequest.ssoTenant.id;
    return await this.prismaClient.ssoRefreshSession.findFirstOrThrow({
      where: {
        ...(tenantId ? { tenantId } : {}),
        id,
      },
    });
  }
}
