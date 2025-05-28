import { FindManyArgs, StatusResponse } from '@nestjs-mod/swagger';

import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaToolsService } from '@nestjs-mod/prisma-tools';
import { ValidationError } from '@nestjs-mod/validation';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import {
  CurrentLocale,
  SkipTranslate,
  TranslatesService,
} from 'nestjs-translates';
import { CreateSsoProjectDto } from '../generated/rest/dto/create-sso-project.dto';
import { SsoProjectDto } from '../generated/rest/dto/sso-project.dto';
import { UpdateSsoProjectDto } from '../generated/rest/dto/update-sso-project.dto';
import { Prisma, PrismaClient } from '../generated/prisma-client';
import { SsoCacheService } from '../services/sso-cache.service';
import { SsoTemplatesService } from '../services/sso-templates.service';
import { SSO_FEATURE } from '../sso.constants';
import { CheckSsoRole } from '../sso.decorators';
import { SsoError } from '../sso.errors';
import { FindManySsoProjectResponse } from '../types/find-many-sso-project-response';
import { SsoRole } from '../types/sso-role';

@ApiBadRequestResponse({
  schema: { allOf: refs(SsoError, ValidationError) },
})
@ApiTags('Sso')
@CheckSsoRole([SsoRole.admin])
@Controller('/sso/projects')
@SkipTranslate()
export class SsoProjectsController {
  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly translatesService: TranslatesService,
    private readonly ssoCacheService: SsoCacheService,
    private readonly ssoTemplatesService: SsoTemplatesService
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManySsoProjectResponse })
  async findMany(@Query() args: FindManyArgs) {
    const { take, skip, curPage, perPage } =
      this.prismaToolsService.getFirstSkipFromCurPerPage({
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
          ...(key in Prisma.SsoProjectScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {}
      );
    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        ssoProjects: await prisma.ssoProject.findMany({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText)
                      ? [{ id: { equals: searchText } }]
                      : []),
                    {
                      clientId: { contains: searchText, mode: 'insensitive' },
                    },
                  ],
                }
              : {}),
          },
          take,
          skip,
          orderBy,
        }),
        totalResults: await prisma.ssoProject.count({
          where: {
            ...(searchText
              ? {
                  OR: [
                    ...(isUUID(searchText)
                      ? [{ id: { equals: searchText } }]
                      : []),
                    {
                      clientId: { contains: searchText, mode: 'insensitive' },
                    },
                  ],
                }
              : {}),
          },
        }),
      };
    });
    return {
      ssoProjects: result.ssoProjects,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }

  @Post()
  @ApiCreatedResponse({ type: SsoProjectDto })
  async createOne(@Body() args: CreateSsoProjectDto) {
    const result = await this.prismaClient.ssoProject.create({
      data: {
        ...args,
      },
    });

    await this.ssoTemplatesService.createProjectDefaultEmailTemplates(
      result.id
    );

    // fill cache
    await this.ssoCacheService.getCachedProject(result.clientId);

    return result;
  }

  @Put(':id')
  @ApiOkResponse({ type: SsoProjectDto })
  async updateOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateSsoProjectDto
  ) {
    const result = await this.prismaClient.ssoProject.update({
      data: { ...args, updatedAt: new Date() },
      where: {
        id,
      },
    });

    await this.ssoCacheService.clearCacheProjectByClientId(result.clientId);

    return result;
  }

  @Delete(':id')
  @ApiOkResponse({ type: StatusResponse })
  async deleteOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    // todo: change to InjectTranslateFunction, after write all posts
    @CurrentLocale() locale: string
  ) {
    await this.prismaClient.ssoProject.delete({
      where: {
        id,
      },
    });
    return { message: this.translatesService.translate('ok', locale) };
  }

  @Get(':id')
  @ApiOkResponse({ type: SsoProjectDto })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.prismaClient.ssoProject.findFirstOrThrow({
      where: {
        id,
      },
    });
  }
}
