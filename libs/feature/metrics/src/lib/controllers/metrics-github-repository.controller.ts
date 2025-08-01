import { StatusResponse } from '@nestjs-mod/swagger';

import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaToolsService } from '@nestjs-mod/prisma-tools';
import { ValidationError } from '@nestjs-mod/validation';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';
import { MetricsRole, MetricsUser, Prisma, PrismaClient } from '../generated/prisma-client';
import { CreateMetricsGithubRepositoryDto } from '../generated/rest/dto/create-metrics-github-repository.dto';
import { MetricsGithubRepositoryDto } from '../generated/rest/dto/metrics-github-repository.dto';
import { UpdateMetricsGithubRepositoryDto } from '../generated/rest/dto/update-metrics-github-repository.dto';
import { METRICS_FEATURE } from '../metrics.constants';
import { CheckMetricsRole, CurrentMetricsExternalTenantId, CurrentMetricsUser } from '../metrics.decorators';
import { MetricsError } from '../metrics.errors';
import { FindManyMetricsArgs } from '../types/FindManyMetricsArgs';
import { FindManyMetricsGithubRepositoryResponse } from '../types/FindManyMetricsGithubRepositoryResponse';

@ApiBadRequestResponse({
  schema: { allOf: refs(MetricsError, ValidationError) },
})
@ApiTags('Metrics')
@CheckMetricsRole([MetricsRole.User, MetricsRole.Admin])
@Controller('/metrics/github/repository')
export class MetricsGithubRepositoryController {
  constructor(
    @InjectPrismaClient(METRICS_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManyMetricsGithubRepositoryResponse })
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
        metricsGithubRepositories: await prisma.metricsGithubRepository.findMany({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }] : []),
                    { tenantId: { equals: searchText, mode: 'insensitive' } },
                  ],
                }
              : {}),

            ...(metricsUser.userRole === MetricsRole.Admin
              ? { externalTenantId: args.tenantId }
              : {
                  externalTenantId:
                    metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
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
                  ],
                }
              : {}),
            ...(metricsUser.userRole === MetricsRole.Admin
              ? { externalTenantId: args.tenantId }
              : {
                  externalTenantId:
                    metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
                }),
          },
        }),
      };
    });
    return {
      metricsGithubRepositories: result.metricsGithubRepositories,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }

  @Post()
  @ApiCreatedResponse({ type: MetricsGithubRepositoryDto })
  async createOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Body() args: CreateMetricsGithubRepositoryDto,
  ) {
    return await this.prismaClient.metricsGithubRepository.create({
      data: {
        ...args,
        MetricsUser_MetricsGithubRepository_createdByToMetricsUser: { connect: { id: metricsUser.id } },
        MetricsUser_MetricsGithubRepository_updatedByToMetricsUser: { connect: { id: metricsUser.id } },
        ...(metricsUser.userRole === MetricsRole.Admin
          ? { externalTenantId }
          : {
              externalTenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
            }),
      },
    });
  }

  @Put(':id')
  @ApiOkResponse({ type: MetricsGithubRepositoryDto })
  async updateOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateMetricsGithubRepositoryDto,
  ) {
    return await this.prismaClient.metricsGithubRepository.update({
      data: {
        ...args,
        MetricsUser_MetricsGithubRepository_updatedByToMetricsUser: { connect: { id: metricsUser.id } },
        updatedAt: new Date(),
      },
      where: {
        id,
        ...(metricsUser.userRole === MetricsRole.Admin
          ? {}
          : {
              externalTenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
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
    await this.prismaClient.metricsGithubRepository.delete({
      where: {
        id,
        ...(metricsUser.userRole === MetricsRole.Admin
          ? {}
          : {
              externalTenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
            }),
      },
    });
    return { message: getText('ok') };
  }

  @Get(':id')
  @ApiOkResponse({ type: MetricsGithubRepositoryDto })
  async findOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.prismaClient.metricsGithubRepository.findFirstOrThrow({
      where: {
        id,

        ...(metricsUser.userRole === MetricsRole.Admin
          ? {}
          : {
              externalTenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
            }),
      },
    });
  }
}
