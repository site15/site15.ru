import { Prisma, PrismaClient } from '@prisma/sso-client';

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
  ApiOkResponse,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { SsoUserDto } from '../generated/rest/dto/sso-user.dto';
import { UpdateSsoUserDto } from '../generated/rest/dto/update-sso-user.dto';
import { SsoCacheService } from '../services/sso-cache.service';
import { SsoPasswordService } from '../services/sso-password.service';
import { SSO_FEATURE } from '../sso.constants';
import { CurrentSsoRequest } from '../sso.decorators';
import { SsoError } from '../sso.errors';
import { FindManySsoUserArgs } from '../types/find-many-sso-user-args';
import { FindManySsoUserResponse } from '../types/find-many-sso-user-response';
import { SsoRequest } from '../types/sso-request';

@ApiBadRequestResponse({
  schema: { allOf: refs(SsoError, ValidationError) },
})
@ApiTags('Sso')
@Controller('/sso/users')
export class SsoUsersController {
  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly ssoPasswordService: SsoPasswordService,
    private readonly ssoCacheService: SsoCacheService
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManySsoUserResponse })
  async findMany(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Query() args: FindManySsoUserArgs
  ) {
    const { take, skip, curPage, perPage } =
      this.prismaToolsService.getFirstSkipFromCurPerPage({
        curPage: args.curPage,
        perPage: args.perPage,
      });
    const searchText = args.searchText;
    const projectId = ssoRequest.ssoIsAdmin
      ? args.projectId
      : ssoRequest.ssoProject.id;

    const orderBy = (args.sort || 'createdAt:desc')
      .split(',')
      .map((s) => s.split(':'))
      .reduce(
        (all, [key, value]) => ({
          ...all,
          ...(key in Prisma.SsoUserScalarFieldEnum
            ? {
                [key]: value === 'desc' ? 'desc' : 'asc',
              }
            : {}),
        }),
        {}
      );

    const result = await this.prismaClient.$transaction(async (prisma) => {
      return {
        ssoUsers: await prisma.ssoUser.findMany({
          where: {
            ...(projectId ? { projectId: { equals: projectId } } : {}),
            ...(searchText
              ? isUUID(searchText)
                ? {
                    OR: [{ id: { equals: searchText } }],
                  }
                : {
                    OR: [
                      { email: { contains: searchText, mode: 'insensitive' } },
                      {
                        username: { contains: searchText, mode: 'insensitive' },
                      },
                      {
                        firstname: {
                          contains: searchText,
                          mode: 'insensitive',
                        },
                      },
                      {
                        lastname: { contains: searchText, mode: 'insensitive' },
                      },
                    ],
                  }
              : {}),
          },
          take,
          skip,
          orderBy,
        }),
        totalResults: await prisma.ssoUser.count({
          where: {
            ...(projectId ? { projectId: { equals: projectId } } : {}),
            ...(searchText
              ? isUUID(searchText)
                ? {
                    OR: [{ id: { equals: searchText } }],
                  }
                : {
                    OR: [
                      { email: { contains: searchText, mode: 'insensitive' } },
                      {
                        username: { contains: searchText, mode: 'insensitive' },
                      },
                      {
                        firstname: {
                          contains: searchText,
                          mode: 'insensitive',
                        },
                      },
                      {
                        lastname: { contains: searchText, mode: 'insensitive' },
                      },
                    ],
                  }
              : {}),
          },
        }),
      };
    });

    return {
      ssoUsers: result.ssoUsers,
      meta: {
        totalResults: result.totalResults,
        curPage,
        perPage,
      },
    };
  }

  @Put(':id')
  @ApiOkResponse({ type: SsoUserDto })
  async updateOne(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateSsoUserDto
  ) {
    const projectId = ssoRequest.ssoIsAdmin
      ? undefined
      : ssoRequest.ssoProject.id;
    const result = await this.prismaClient.ssoUser.update({
      data: {
        ...args,
        ...(args.password
          ? {
              password: await this.ssoPasswordService.createPasswordHash(
                args.password
              ),
            }
          : {}),
        updatedAt: new Date(),
      },
      where: {
        id,
        ...(projectId ? { projectId: { equals: projectId } } : {}),
      },
    });

    await this.ssoCacheService.clearCacheByUserId({ userId: id });

    return result;
  }

  @Get(':id')
  @ApiOkResponse({ type: SsoUserDto })
  async findOne(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    const projectId = ssoRequest.ssoIsAdmin
      ? undefined
      : ssoRequest.ssoProject.id;
    return await this.prismaClient.ssoUser.findFirstOrThrow({
      where: {
        id,
        ...(projectId ? { projectId } : {}),
      },
    });
  }
}
