import { StatusResponse } from '@nestjs-mod/swagger';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaToolsService } from '@nestjs-mod/prisma-tools';
import { ValidationError } from '@nestjs-mod/validation';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';
import { MetricsRole, MetricsUser, Prisma, PrismaClient } from '../generated/prisma-client';
import { CreateMetricsGithubMetricDto } from '../generated/rest/dto/create-metrics-github-metric.dto';
import { MetricsGithubMetricDto } from '../generated/rest/dto/metrics-github-metric.dto';
import { UpdateMetricsGithubMetricDto } from '../generated/rest/dto/update-metrics-github-metric.dto';
import { METRICS_API_TAG, METRICS_FEATURE, METRICS_GITHUB_METRIC_CONTROLLER_PATH } from '../metrics.constants';
import { CheckMetricsRole, CurrentMetricsExternalTenantId, CurrentMetricsUser } from '../metrics.decorators';
import { MetricsError } from '../metrics.errors';
import { FindManyMetricsArgs } from '../types/FindManyMetricsArgs';
import { FindManyMetricsGithubMetricResponse } from '../types/FindManyMetricsGithubMetricResponse';
import { CreateFullMetricsGithubMetricDto } from '../types/CreateFullMetricsGithubMetricDto';

@ApiBadRequestResponse({
  schema: { allOf: refs(MetricsError, ValidationError) },
})
@ApiTags(METRICS_API_TAG)
@CheckMetricsRole([MetricsRole.User, MetricsRole.Admin])
@Controller(METRICS_GITHUB_METRIC_CONTROLLER_PATH)
export class MetricsGithubMetricController {
  constructor(
    @InjectPrismaClient(METRICS_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManyMetricsGithubMetricResponse })
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

    const orderBy = (args.sort || 'recordedAt:desc')
      .split(',')
      .map((s) => s.split(':'))
      .reduce(
        (all, [key, value]) => ({
          ...all,
          ...(key in Prisma.MetricsGithubMetricScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {},
      );
    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        metricsGithubMetrics: await prisma.metricsGithubMetric.findMany({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }] : []),
                    { tenantId: { equals: searchText, mode: 'insensitive' } },
                    { metricName: { contains: searchText, mode: 'insensitive' } },
                    { repositoryId: { equals: searchText } },
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
        totalResults: await prisma.metricsGithubMetric.count({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }] : []),
                    { tenantId: { equals: searchText, mode: 'insensitive' } },
                    { metricName: { contains: searchText, mode: 'insensitive' } },
                    { repositoryId: { equals: searchText } },
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
      metricsGithubMetrics: result.metricsGithubMetrics,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }

  @Post()
  @ApiCreatedResponse({ type: MetricsGithubMetricDto })
  async createOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Body() args: CreateFullMetricsGithubMetricDto,
  ) {
    return await this.prismaClient.metricsGithubMetric.create({
      data: {
        metricName: args.metricName,
        metricValue: args.metricValue,
        recordedAt: args.recordedAt,
        MetricsGithubRepository: { connect: { id: args.repositoryId } },
        createdBy: metricsUser.id,
        updatedBy: metricsUser.id,
        ...(metricsUser.userRole === MetricsRole.Admin
          ? { tenantId: externalTenantId }
          : {
              tenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
            }),
      } as any,
    });
  }

  @Put(':id')
  @ApiOkResponse({ type: MetricsGithubMetricDto })
  async updateOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateMetricsGithubMetricDto,
  ) {
    return await this.prismaClient.metricsGithubMetric.update({
      data: {
        ...args,
        updatedBy: metricsUser.id,
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
    await this.prismaClient.metricsGithubMetric.delete({
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
  @ApiOkResponse({ type: MetricsGithubMetricDto })
  async findOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.prismaClient.metricsGithubMetric.findFirstOrThrow({
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
