import { FindManyArgs, StatusResponse } from '@nestjs-mod-sso/common';
import { Prisma, PrismaClient } from '@prisma/sso-client';

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
import { isUUID } from 'class-validator';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';
import { SsoUser } from '../generated/rest/dto/sso-user.entity';
import { UpdateSsoUserDto } from '../generated/rest/dto/update-sso-user.dto';
import { SsoPasswordService } from '../services/sso-password.service';
import { SSO_FEATURE } from '../sso.constants';
import { SsoCheckIsAdmin } from '../sso.decorators';
import { SsoError } from '../sso.errors';
import { FindManySsoUserResponse } from '../types/find-many-sso-user-response';

@ApiExtraModels(SsoError, ValidationError)
@ApiBadRequestResponse({
  schema: { allOf: refs(SsoError, ValidationError) },
})
@ApiTags('Sso')
@SsoCheckIsAdmin()
@Controller('/sso/users')
export class SsoUsersController {
  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly ssoPasswordService: SsoPasswordService
  ) {}

  @Get()
  @ApiOkResponse({ type: FindManySsoUserResponse })
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
            ...(isUUID(searchText)
              ? {
                  OR: [{ id: { equals: searchText } }],
                }
              : {
                  OR: [
                    { email: { contains: searchText, mode: 'insensitive' } },
                    { username: { contains: searchText, mode: 'insensitive' } },
                    {
                      firstname: { contains: searchText, mode: 'insensitive' },
                    },
                    { lastname: { contains: searchText, mode: 'insensitive' } },
                  ],
                }),
          },
          take,
          skip,
          orderBy,
        }),
        totalResults: await prisma.ssoUser.count({
          where: {
            ...(isUUID(searchText)
              ? {
                  OR: [{ id: { equals: searchText } }],
                }
              : {
                  OR: [
                    { email: { contains: searchText, mode: 'insensitive' } },
                    { username: { contains: searchText, mode: 'insensitive' } },
                    {
                      firstname: { contains: searchText, mode: 'insensitive' },
                    },
                    { lastname: { contains: searchText, mode: 'insensitive' } },
                  ],
                }),
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
  @ApiOkResponse({ type: SsoUser })
  async updateOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() args: UpdateSsoUserDto
  ) {
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
      },
    });
    return result;
  }

  @Delete(':id')
  @ApiOkResponse({ type: StatusResponse })
  async deleteOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @InjectTranslateFunction() getText: TranslateFunction
  ) {
    await this.prismaClient.ssoUser.delete({
      where: {
        id,
      },
    });
    return { message: getText('ok') };
  }

  @Get(':id')
  @ApiOkResponse({ type: SsoUser })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.prismaClient.ssoUser.findFirstOrThrow({
      where: {
        id,
      },
    });
  }
}
