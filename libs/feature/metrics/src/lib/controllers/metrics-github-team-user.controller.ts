import { StatusResponse } from '@nestjs-mod/swagger';

import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaToolsService } from '@nestjs-mod/prisma-tools';
import { ValidationError } from '@nestjs-mod/validation';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';
import { MetricsRole, MetricsUser, Prisma, PrismaClient } from '../generated/prisma-client';
import { MetricsGithubTeamUserDto } from '../generated/rest/dto/metrics-github-team-user.dto';
import { UpdateMetricsGithubTeamUserDto } from '../generated/rest/dto/update-metrics-github-team-user.dto';
import { METRICS_API_TAG, METRICS_FEATURE, METRICS_GITHUB_TEAM_USER_CONTROLLER_PATH } from '../metrics.constants';
import { CheckMetricsRole, CurrentMetricsExternalTenantId, CurrentMetricsUser } from '../metrics.decorators';
import { MetricsError } from '../metrics.errors';
import { FindManyMetricsGithubTeamUserArgs } from '../types/FindManyMetricsGithubTeamUserArgs';
import { CreateFullMetricsGithubTeamUserDto } from '../types/CreateFullMetricsGithubTeamUserDto';
import { FindManyMetricsGithubTeamUserResponse } from '../types/FindManyMetricsGithubTeamUserResponse';

@ApiBadRequestResponse({
  schema: { allOf: refs(MetricsError, ValidationError) },
})
@ApiTags(METRICS_API_TAG)
@CheckMetricsRole([MetricsRole.User, MetricsRole.Admin])
@Controller(METRICS_GITHUB_TEAM_USER_CONTROLLER_PATH)
export class MetricsGithubTeamUserController {
  constructor(
    @InjectPrismaClient(METRICS_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManyMetricsGithubTeamUserResponse })
  async findMany(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Query() args: FindManyMetricsGithubTeamUserArgs,
  ) {
    const { take, skip, curPage, perPage } = this.prismaToolsService.getFirstSkipFromCurPerPage({
      curPage: args.curPage,
      perPage: args.perPage,
    });
    const searchText = args.searchText;
    const teamId = args.teamId;
    const userId = args.userId;

    const orderBy = (args.sort || 'createdAt:desc')
      .split(',')
      .map((s) => s.split(':'))
      .reduce(
        (all, [key, value]) => ({
          ...all,
          ...(key in Prisma.MetricsGithubTeamUserScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {},
      );
    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        metricsGithubTeamUsers: await prisma.metricsGithubTeamUser.findMany({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }] : []),
                    { tenantId: { equals: searchText, mode: 'insensitive' } },
                    { teamId: { equals: searchText } },
                    { userId: { equals: searchText } },
                    { role: { contains: searchText, mode: 'insensitive' } },
                  ],
                }
              : {}),
            ...(teamId ? { teamId: { equals: teamId } } : {}),
            ...(userId ? { userId: { equals: userId } } : {}),

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
        totalResults: await prisma.metricsGithubTeamUser.count({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }] : []),
                    { tenantId: { equals: searchText, mode: 'insensitive' } },
                    { teamId: { equals: searchText } },
                    { userId: { equals: searchText } },
                    { role: { contains: searchText, mode: 'insensitive' } },
                  ],
                }
              : {}),
            ...(teamId ? { teamId: { equals: teamId } } : {}),
            ...(userId ? { userId: { equals: userId } } : {}),
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
      metricsGithubTeamUsers: result.metricsGithubTeamUsers,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }

  @Post()
  @ApiCreatedResponse({ type: MetricsGithubTeamUserDto })
  async createOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Body() args: CreateFullMetricsGithubTeamUserDto,
  ) {
    return await this.prismaClient.metricsGithubTeamUser.create({
      data: {
        ...(args.role !== undefined ? { role: args.role } : {}),
        MetricsGithubTeam: { connect: { id: args.teamId } },
        MetricsGithubUser: { connect: { id: args.userId } },
        MetricsUser_MetricsGithubTeamUser_createdByToMetricsUser: { connect: { id: metricsUser.id } },
        MetricsUser_MetricsGithubTeamUser_updatedByToMetricsUser: { connect: { id: metricsUser.id } },
        ...(metricsUser.userRole === MetricsRole.Admin
          ? { tenantId: externalTenantId }
          : {
              tenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
            }),
      },
    });
  }

  @Put(':id')
  @ApiOkResponse({ type: MetricsGithubTeamUserDto })
  async updateOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateMetricsGithubTeamUserDto,
  ) {
    return await this.prismaClient.metricsGithubTeamUser.update({
      data: {
        ...(args.role !== undefined ? { role: args.role } : {}),
        MetricsUser_MetricsGithubTeamUser_updatedByToMetricsUser: { connect: { id: metricsUser.id } },
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
    await this.prismaClient.metricsGithubTeamUser.delete({
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
  @ApiOkResponse({ type: MetricsGithubTeamUserDto })
  async findOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.prismaClient.metricsGithubTeamUser.findFirstOrThrow({
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
