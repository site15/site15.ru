import { PrismaToolsService } from '@nestjs-mod-sso/prisma-tools';
import { ValidationError } from '@nestjs-mod-sso/validation';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
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
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { Prisma, PrismaClient } from '@prisma/sso-client';
import { isUUID } from 'class-validator';
import { SsoRefreshSessionDto } from '../generated/rest/dto/sso-refresh-session.dto';
import { UpdateSsoRefreshSessionDto } from '../generated/rest/dto/update-sso-refresh-session.dto';
import { SSO_FEATURE } from '../sso.constants';
import { SsoCheckIsAdmin } from '../sso.decorators';
import { SsoError } from '../sso.errors';
import { FindManySsoRefreshSessionArgs } from '../types/find-many-sso-refresh-session-args';
import { FindManySsoRefreshSessionResponse } from '../types/find-many-sso-refresh-session-response';
import { SsoEntities } from '../types/sso-entities';
import { SsoCacheService } from '../services/sso-cache.service';

@ApiExtraModels(SsoError, SsoEntities, ValidationError)
@ApiBadRequestResponse({
  schema: { allOf: refs(SsoError, ValidationError) },
})
@ApiTags('Sso')
@SsoCheckIsAdmin()
@Controller('/sso/sessions')
export class SsoRefreshSessionsController {
  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly ssoCacheService: SsoCacheService
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManySsoRefreshSessionResponse })
  async findMany(@Query() args: FindManySsoRefreshSessionArgs) {
    const { take, skip, curPage, perPage } =
      this.prismaToolsService.getFirstSkipFromCurPerPage({
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
        {}
      );
    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        ssoRefreshSessions: await prisma.ssoRefreshSession.findMany({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText)
                      ? [{ id: { equals: searchText } }]
                      : []),
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
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText)
                      ? [{ id: { equals: searchText } }]
                      : []),
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
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateSsoRefreshSessionDto
  ) {
    const result = await this.prismaClient.ssoRefreshSession.update({
      data: { ...args, updatedAt: new Date() },
      where: {
        id,
      },
    });

    await this.ssoCacheService.clearCacheByRefreshSession(result.refreshToken);

    return result;
  }

  @Get(':id')
  @ApiOkResponse({ type: SsoRefreshSessionDto })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.prismaClient.ssoRefreshSession.findFirstOrThrow({
      where: {
        id,
      },
    });
  }
}
