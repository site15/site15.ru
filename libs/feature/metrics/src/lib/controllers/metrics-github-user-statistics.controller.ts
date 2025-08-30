import { StatusResponse } from '@nestjs-mod/swagger';

import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaToolsService } from '@nestjs-mod/prisma-tools';
import { ValidationError } from '@nestjs-mod/validation';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';
import { MetricsRole, MetricsUser, Prisma, PrismaClient } from '../generated/prisma-client';
import { MetricsGithubUserStatisticsDto } from '../generated/rest/dto/metrics-github-user-statistics.dto';
import { UpdateMetricsGithubUserStatisticsDto } from '../generated/rest/dto/update-metrics-github-user-statistics.dto';
import { METRICS_API_TAG, METRICS_FEATURE, METRICS_GITHUB_USER_STATISTICS_CONTROLLER_PATH } from '../metrics.constants';
import { CheckMetricsRole, CurrentMetricsExternalTenantId, CurrentMetricsUser } from '../metrics.decorators';
import { MetricsError, MetricsErrorEnum } from '../metrics.errors';
import { MetricsGithubStatisticsSyncService } from '../services/metrics-github-statistics-sync.service';
import { CreateFullMetricsGithubUserStatisticsDto } from '../types/CreateFullMetricsGithubUserStatisticsDto';
import { FindManyMetricsArgs } from '../types/FindManyMetricsArgs';
import { FindManyMetricsGithubUserStatisticsResponse } from '../types/FindManyMetricsGithubUserStatisticsResponse';

@ApiBadRequestResponse({
  schema: { allOf: refs(MetricsError, ValidationError) },
})
@ApiTags(METRICS_API_TAG)
@CheckMetricsRole([MetricsRole.User, MetricsRole.Admin])
@Controller(METRICS_GITHUB_USER_STATISTICS_CONTROLLER_PATH)
export class MetricsGithubUserStatisticsController {
  constructor(
    @InjectPrismaClient(METRICS_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly metricsGithubStatisticsSyncService: MetricsGithubStatisticsSyncService,
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManyMetricsGithubUserStatisticsResponse })
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
          ...(key in Prisma.MetricsGithubUserStatisticsScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {},
      );
    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        metricsGithubUserStatistics: await prisma.metricsGithubUserStatistics.findMany({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }] : []),
                    { tenantId: { equals: searchText, mode: 'insensitive' } },
                    { userId: { equals: searchText } },
                    { periodType: { contains: searchText, mode: 'insensitive' } },
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
        totalResults: await prisma.metricsGithubUserStatistics.count({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }] : []),
                    { tenantId: { equals: searchText, mode: 'insensitive' } },
                    { userId: { equals: searchText } },
                    { periodType: { contains: searchText, mode: 'insensitive' } },
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
      metricsGithubUserStatistics: result.metricsGithubUserStatistics,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }

  @Post()
  @ApiCreatedResponse({ type: MetricsGithubUserStatisticsDto })
  async createOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Body() args: CreateFullMetricsGithubUserStatisticsDto,
  ) {
    return await this.prismaClient.metricsGithubUserStatistics.create({
      data: {
        periodType: args.periodType,
        ...(args.followersCount !== undefined ? { followersCount: args.followersCount } : {}),
        ...(args.followingCount !== undefined ? { followingCount: args.followingCount } : {}),
        recordedAt: args.recordedAt,
        MetricsGithubUser: { connect: { id: args.userId } },
        MetricsUser_MetricsGithubUserStatistics_createdByToMetricsUser: { connect: { id: metricsUser.id } },
        MetricsUser_MetricsGithubUserStatistics_updatedByToMetricsUser: { connect: { id: metricsUser.id } },
        ...(metricsUser.userRole === MetricsRole.Admin
          ? { tenantId: externalTenantId }
          : {
              tenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
            }),
      },
    });
  }

  @Put(':id')
  @ApiOkResponse({ type: MetricsGithubUserStatisticsDto })
  async updateOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateMetricsGithubUserStatisticsDto,
  ) {
    return await this.prismaClient.metricsGithubUserStatistics.update({
      data: {
        ...(args.periodType !== undefined ? { periodType: args.periodType } : {}),
        ...(args.followersCount !== undefined ? { followersCount: args.followersCount } : {}),
        ...(args.followingCount !== undefined ? { followingCount: args.followingCount } : {}),
        ...(args.recordedAt !== undefined ? { recordedAt: args.recordedAt } : {}),
        MetricsUser_MetricsGithubUserStatistics_updatedByToMetricsUser: { connect: { id: metricsUser.id } },
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
    await this.prismaClient.metricsGithubUserStatistics.delete({
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
  @ApiOkResponse({ type: MetricsGithubUserStatisticsDto })
  async findOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.prismaClient.metricsGithubUserStatistics.findFirstOrThrow({
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

  @Post('sync/user/:id')
  @ApiOkResponse({ type: StatusResponse })
  async syncUserStatistics(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Param('id') id: string,
    @InjectTranslateFunction() getText: TranslateFunction,
  ) {
    try {
      // Check if user has permission to sync this GitHub user
      const githubUser = await this.prismaClient.metricsGithubUser.findFirstOrThrow({
        where: {
          id,
          ...(metricsUser.userRole === MetricsRole.Admin
            ? {}
            : {
                tenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
              }),
        },
      });

      // Trigger synchronization
      await this.metricsGithubStatisticsSyncService.syncUserStatistics(githubUser.id);

      return { message: getText('User statistics synchronization started') };
    } catch (error) {
      throw new MetricsError(MetricsErrorEnum.FORBIDDEN);
    }
  }
}
