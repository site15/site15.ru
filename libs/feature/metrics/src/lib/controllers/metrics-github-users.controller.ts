import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaToolsService } from '@nestjs-mod/prisma-tools';
import { StatusResponse } from '@nestjs-mod/swagger';
import { ValidationError } from '@nestjs-mod/validation';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';
import { MetricsRole, MetricsUser, Prisma, PrismaClient } from '../generated/prisma-client';
import { CreateMetricsGithubUserDto } from '../generated/rest/dto/create-metrics-github-user.dto';
import { MetricsGithubUserDto } from '../generated/rest/dto/metrics-github-user.dto';
import { UpdateMetricsGithubUserDto } from '../generated/rest/dto/update-metrics-github-user.dto';
import { METRICS_API_TAG, METRICS_FEATURE, METRICS_GITHUB_USERS_CONTROLLER_PATH } from '../metrics.constants';
import { CheckMetricsRole, CurrentMetricsExternalTenantId, CurrentMetricsUser } from '../metrics.decorators';
import { MetricsError } from '../metrics.errors';
import { FindManyMetricsGithubUserArgs } from '../types/FindManyMetricsGithubUserArgs';
import { FindManyMetricsGithubUserResponse } from '../types/FindManyMetricsGithubUserResponse';

@ApiBadRequestResponse({
  schema: { allOf: refs(MetricsError, ValidationError) },
})
@ApiTags(METRICS_API_TAG)
@CheckMetricsRole([MetricsRole.User, MetricsRole.Admin])
@Controller(METRICS_GITHUB_USERS_CONTROLLER_PATH)
export class MetricsGithubUsersController {
  constructor(
    @InjectPrismaClient(METRICS_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManyMetricsGithubUserResponse })
  async findMany(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Query() args: FindManyMetricsGithubUserArgs,
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
          ...(key in Prisma.MetricsGithubUserScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {},
      );
    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        metricsGithubUsers: await prisma.metricsGithubUser.findMany({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }] : []),
                    { tenantId: { equals: searchText, mode: 'insensitive' } },
                    { login: { contains: searchText, mode: 'insensitive' } },
                    { name: { contains: searchText, mode: 'insensitive' } },
                    { email: { contains: searchText, mode: 'insensitive' } },
                  ],
                }
              : {}),

            ...(metricsUser.userRole === MetricsRole.Admin
              ? { tenantId: args.tenantId }
              : {
                  tenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
                }),
            ...(args.repositoryId
              ? {
                  MetricsGithubUser_MetricsGithubUserRepository_userIdTometricsGithubUser: {
                    some: {
                      repositoryId: { equals: args.repositoryId },
                    },
                  },
                }
              : {}),
          },
          take,
          skip,
          orderBy,
        }),
        totalResults: await prisma.metricsGithubUser.count({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText) ? [{ id: { equals: searchText } }] : []),
                    { tenantId: { equals: searchText, mode: 'insensitive' } },
                    { login: { contains: searchText, mode: 'insensitive' } },
                    { name: { contains: searchText, mode: 'insensitive' } },
                    { email: { contains: searchText, mode: 'insensitive' } },
                  ],
                }
              : {}),
            ...(metricsUser.userRole === MetricsRole.Admin
              ? { tenantId: args.tenantId }
              : {
                  tenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
                }),
            ...(args.repositoryId
              ? {
                  MetricsGithubUser_MetricsGithubUserRepository_userIdTometricsGithubUser: {
                    some: {
                      repositoryId: { equals: args.repositoryId },
                    },
                  },
                }
              : {}),
          },
        }),
      };
    });
    return {
      metricsGithubUsers: result.metricsGithubUsers,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }

  @Post()
  @ApiCreatedResponse({ type: MetricsGithubUserDto })
  async createOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Body() args: CreateMetricsGithubUserDto,
  ) {
    return await this.prismaClient.metricsGithubUser.create({
      data: {
        login: args.login,
        ...(args.name !== undefined ? { name: args.name } : {}),
        ...(args.email !== undefined ? { email: args.email } : {}),
        ...(args.description !== undefined ? { description: args.description } : {}),
        ...(args.avatarUrl !== undefined ? { avatarUrl: args.avatarUrl } : {}),
        ...(args.websiteUrl !== undefined ? { websiteUrl: args.websiteUrl } : {}),
        ...(args.location !== undefined ? { location: args.location } : {}),
        ...(args.telegramUrl !== undefined ? { telegramUrl: args.telegramUrl } : {}),
        ...(args.twitterUrl !== undefined ? { twitterUrl: args.twitterUrl } : {}),
        MetricsUser_MetricsGithubUser_createdByToMetricsUser: { connect: { id: metricsUser.id } },
        MetricsUser_MetricsGithubUser_updatedByToMetricsUser: { connect: { id: metricsUser.id } },
        ...(metricsUser.userRole === MetricsRole.Admin
          ? { tenantId: externalTenantId }
          : {
              tenantId: metricsUser?.userRole === MetricsRole.User ? metricsUser.tenantId : externalTenantId,
            }),
      },
    });
  }

  @Put(':id')
  @ApiOkResponse({ type: MetricsGithubUserDto })
  async updateOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateMetricsGithubUserDto,
  ) {
    return await this.prismaClient.metricsGithubUser.update({
      data: {
        ...(args.login !== undefined ? { login: args.login } : {}),
        ...(args.name !== undefined ? { name: args.name } : {}),
        ...(args.email !== undefined ? { email: args.email } : {}),
        ...(args.description !== undefined ? { description: args.description } : {}),
        ...(args.avatarUrl !== undefined ? { avatarUrl: args.avatarUrl } : {}),
        ...(args.websiteUrl !== undefined ? { websiteUrl: args.websiteUrl } : {}),
        ...(args.location !== undefined ? { location: args.location } : {}),
        ...(args.telegramUrl !== undefined ? { telegramUrl: args.telegramUrl } : {}),
        ...(args.twitterUrl !== undefined ? { twitterUrl: args.twitterUrl } : {}),
        MetricsUser_MetricsGithubUser_updatedByToMetricsUser: { connect: { id: metricsUser.id } },
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
    await this.prismaClient.metricsGithubUser.delete({
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
  @ApiOkResponse({ type: MetricsGithubUserDto })
  async findOne(
    @CurrentMetricsExternalTenantId() externalTenantId: string,
    @CurrentMetricsUser() metricsUser: MetricsUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.prismaClient.metricsGithubUser.findFirstOrThrow({
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
