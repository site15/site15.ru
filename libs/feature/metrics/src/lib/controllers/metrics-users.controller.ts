import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaToolsService } from '@nestjs-mod/prisma-tools';
import { StatusResponse } from '@nestjs-mod/swagger';
import { ValidationError } from '@nestjs-mod/validation';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';
import { MetricsRole, MetricsUser, Prisma, PrismaClient } from '../generated/prisma-client';
import { MetricsUserDto } from '../generated/rest/dto/metrics-user.dto';
import { UpdateMetricsUserDto } from '../generated/rest/dto/update-metrics-user.dto';
import { METRICS_API_TAG, METRICS_FEATURE, METRICS_USERS_CONTROLLER_PATH } from '../metrics.constants';
import { CheckMetricsRole, CurrentMetricsExternalTenantId, CurrentMetricsUser } from '../metrics.decorators';
import { MetricsError } from '../metrics.errors';
import { CreateFullMetricsUserDto } from '../types/CreateFullMetricsUserDto';
import { FindManyMetricsArgs } from '../types/FindManyMetricsArgs';
import { FindManyMetricsUserResponse } from '../types/FindManyMetricsUserResponse';

@ApiBadRequestResponse({
  schema: { allOf: refs(MetricsError, ValidationError) },
})
@ApiTags(METRICS_API_TAG)
@CheckMetricsRole([MetricsRole.Admin])
@Controller(METRICS_USERS_CONTROLLER_PATH)
export class MetricsUsersController {
  constructor(
    @InjectPrismaClient(METRICS_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManyMetricsUserResponse })
  async findMany(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Query() args: FindManyMetricsArgs,
  ) {
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
          ...(key in Prisma.MetricsUserScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {},
      );
    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        metricsUsers: await prisma.metricsUser.findMany({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }] : []),
                    { tenantId: { equals: searchText, mode: 'insensitive' } },
                    { externalUserId: { equals: searchText } },
                  ],
                }
              : {}),

            ...(metricsUser.userRole === MetricsRole.Admin
              ? { tenantId: args.tenantId }
              : {
                  tenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
                }),
          },
          take,
          skip,
          orderBy,
        }),
        totalResults: await prisma.metricsUser.count({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }] : []),
                    { tenantId: { equals: searchText, mode: 'insensitive' } },
                    { externalUserId: { equals: searchText } },
                  ],
                }
              : {}),
            ...(metricsUser.userRole === MetricsRole.Admin
              ? { tenantId: args.tenantId }
              : {
                  tenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
                }),
          },
        }),
      };
    });
    return {
      metricsUsers: result.metricsUsers,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }

  @Post()
  @ApiCreatedResponse({ type: MetricsUserDto })
  async createOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Body() args: CreateFullMetricsUserDto,
  ) {
    return await this.prismaClient.metricsUser.create({
      data: {
        externalUserId: metricsUser.externalUserId,
        userRole: args.userRole,
        ...(metricsUser.userRole === MetricsRole.Admin
          ? { tenantId: externalTenantId }
          : {
              tenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
            }),
      },
    });
  }

  @Put(':id')
  @ApiOkResponse({ type: MetricsUserDto })
  async updateOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateMetricsUserDto,
  ) {
    return await this.prismaClient.metricsUser.update({
      data: {
        ...(args.userRole !== undefined ? { userRole: args.userRole } : {}),
        updatedAt: new Date(),
      },
      where: {
        id,
        ...(metricsUser.userRole === MetricsRole.Admin
          ? {}
          : {
              tenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
            }),
      },
    });
  }

  @Delete(':id')
  @ApiOkResponse({ type: StatusResponse })
  async deleteOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @InjectTranslateFunction() getText: TranslateFunction,
  ) {
    await this.prismaClient.metricsUser.delete({
      where: {
        id,
        ...(metricsUser.userRole === MetricsRole.Admin
          ? {}
          : {
              tenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
            }),
      },
    });
    return { message: getText('ok') };
  }

  @Get(':id')
  @ApiOkResponse({ type: MetricsUserDto })
  async findOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.prismaClient.metricsUser.findFirstOrThrow({
      where: {
        id,

        ...(metricsUser.userRole === MetricsRole.Admin
          ? {}
          : {
              tenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
            }),
      },
    });
  }
}
