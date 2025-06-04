import { WebhookService } from '@nestjs-mod/webhook';
import { searchIn } from '@nestjs-mod/misc';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaToolsService } from '@nestjs-mod/prisma-tools';
import { StatusResponse } from '@nestjs-mod/swagger';
import { ValidationError } from '@nestjs-mod/validation';
import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
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
import { randomUUID } from 'crypto';
import { omit } from 'lodash/fp';
import { SsoUserDto } from '../generated/rest/dto/sso-user.dto';
import { UpdateSsoUserDto } from '../generated/rest/dto/update-sso-user.dto';
import { Prisma, PrismaClient } from '../generated/prisma-client';
import { SsoCacheService } from '../services/sso-cache.service';
import { SsoEventsService } from '../services/sso-events.service';
import { SsoPasswordService } from '../services/sso-password.service';
import { SsoService } from '../services/sso.service';
import { OperationName } from '../sso.configuration';
import { SSO_FEATURE } from '../sso.constants';
import { CurrentSsoRequest } from '../sso.decorators';
import { SsoError } from '../sso.errors';
import { FindManySsoUserArgs } from '../types/find-many-sso-user-args';
import { FindManySsoUserResponse } from '../types/find-many-sso-user-response';
import { SendInvitationLinksArgs } from '../types/send-invitation-links.dto';
import { SsoRequest } from '../types/sso-request';
import { SsoRole } from '../types/sso-role';
import { SsoWebhookEvent } from '../types/sso-webhooks';

@ApiBadRequestResponse({
  schema: { allOf: refs(SsoError, ValidationError) },
})
@ApiTags('Sso')
@Controller('/sso/users')
export class SsoUsersController {
  private readonly logger = new Logger(SsoUsersController.name);

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly ssoPasswordService: SsoPasswordService,
    private readonly ssoCacheService: SsoCacheService,
    private readonly ssoService: SsoService,
    private readonly webhookService: WebhookService,
    private readonly ssoEventsService: SsoEventsService
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
    const projectId = searchIn(SsoRole.admin, ssoRequest.ssoUser?.roles)
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
    const projectId = searchIn(SsoRole.admin, ssoRequest.ssoUser?.roles)
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

  @Post('send-invitation-links')
  @ApiOkResponse({ type: StatusResponse })
  async sendInvitationLinks(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() args: SendInvitationLinksArgs
  ) {
    const emails = args.emails.split(',').map((e) => e.trim());
    for (const email of emails) {
      const signUpArgs = {
        fingerprint: '',
        confirmPassword: '',
        password: randomUUID(),
        email,
      };
      const user = await this.ssoService.signUp({
        signUpArgs,
        projectId: ssoRequest.ssoProject.id,
        operationName:
          OperationName.COMPLETE_REGISTRATION_USING_THE_INVITATION_LINK,
      });

      await this.webhookService.sendEvent({
        eventName: SsoWebhookEvent['sso.sign-up'],
        eventBody: omit(['password'], user),
        eventHeaders: { projectId: ssoRequest.ssoProject.id },
      });

      if (user.emailVerifiedAt !== null) {
        await this.ssoEventsService.send({
          SignUp: { signUpArgs: signUpArgs },
          userId: user.id,
        });
      }
    }
    return { message: 'ok' };
  }

  @Get(':id')
  @ApiOkResponse({ type: SsoUserDto })
  async findOne(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    const projectId = searchIn(SsoRole.admin, ssoRequest.ssoUser?.roles)
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
