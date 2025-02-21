import { FindManyArgs, StatusResponse } from '@nestjs-mod-sso/common';

import { PrismaToolsService } from '@nestjs-mod-sso/prisma-tools';
import { ValidationError } from '@nestjs-mod-sso/validation';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
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
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { Prisma, PrismaClient } from '@prisma/sso-client';
import { isUUID } from 'class-validator';
import { CurrentLocale, TranslatesService } from 'nestjs-translates';
import { CreateSsoProjectDto } from '../generated/rest/dto/create-sso-project.dto';
import { SsoProject } from '../generated/rest/dto/sso-project.entity';
import { UpdateSsoProjectDto } from '../generated/rest/dto/update-sso-project.dto';
import { SSO_FEATURE } from '../sso.constants';
import { CheckSsoIsAdmin } from '../sso.decorators';
import { SsoError } from '../sso.errors';
import { FindManySsoProjectResponse } from '../types/find-many-sso-project-response';
import { SsoEntities } from '../types/sso-entities';

@ApiExtraModels(SsoError, SsoEntities, ValidationError)
@ApiBadRequestResponse({
  schema: { allOf: refs(SsoError, ValidationError) },
})
@ApiTags('Sso')
@CheckSsoIsAdmin()
@Controller('/sso/projects')
export class SsoProjectsController {
  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly translatesService: TranslatesService
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
  @ApiCreatedResponse({ type: SsoProject })
  async createOne(@Body() args: CreateSsoProjectDto) {
    return await this.prismaClient.ssoProject.create({
      data: {
        ...args,
      },
    });
  }

  @Put(':id')
  @ApiOkResponse({ type: SsoProject })
  async updateOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateSsoProjectDto
  ) {
    return await this.prismaClient.ssoProject.update({
      data: { ...args, updatedAt: new Date() },
      where: {
        id,
      },
    });
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
  @ApiOkResponse({ type: SsoProject })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.prismaClient.ssoProject.findFirstOrThrow({
      where: {
        id,
      },
    });
  }
}
