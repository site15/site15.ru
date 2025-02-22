import { PrismaToolsService } from '@nestjs-mod-sso/prisma-tools';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/sso-client';
import { CreateSsoUserDto } from '../generated/rest/dto/create-sso-user.dto';
import { SsoUser } from '../generated/rest/dto/sso-user.entity';
import { SSO_FEATURE } from '../sso.constants';
import { SsoError, SsoErrorEnum } from '../sso.errors';
import { SignUpArgs } from '../types/sign-up.dto';
import { SsoEventsService } from './sso-events.service';
import { SsoPasswordService } from './sso-password.service';

@Injectable()
export class SsoUsersService {
  private readonly logger = new Logger(SsoUsersService.name);

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly ssoPasswordService: SsoPasswordService,
    private readonly ssoEventsService: SsoEventsService,
    private readonly prismaToolsService: PrismaToolsService
  ) {}

  async getByEmail(email: string, projectId: string) {
    try {
      return await this.prismaClient.ssoUser.findUniqueOrThrow({
        where: { email_projectId: { email, projectId } },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (this.prismaToolsService.isErrorOfRecordNotFound(err)) {
        throw new SsoError(SsoErrorEnum.UserNotFound);
      }
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  async getById(id: string) {
    try {
      return await this.prismaClient.ssoUser.findUniqueOrThrow({
        where: { id },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (this.prismaToolsService.isErrorOfRecordNotFound(err)) {
        throw new SsoError(SsoErrorEnum.UserNotFound);
      }
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  async getByEmailAndPassword(
    email: string,
    password: string,
    projectId: string
  ) {
    try {
      const user = await this.prismaClient.ssoUser.findUniqueOrThrow({
        where: { email_projectId: { email, projectId } },
      });
      if (
        !(await this.ssoPasswordService.comparePasswordWithHash(
          password,
          user.password
        ))
      ) {
        throw new SsoError(SsoErrorEnum.WrongPassword);
      }
      return user;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (this.prismaToolsService.isErrorOfRecordNotFound(err)) {
        throw new SsoError(SsoErrorEnum.UserNotFound);
      }
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  async create(user: CreateSsoUserDto, projectId: string) {
    const hashedPassword = await this.ssoPasswordService.createPasswordHash(
      user.password
    );
    try {
      return await this.prismaClient.ssoUser.create({
        data: {
          ...user,
          username: user.username || user.email,
          password: hashedPassword,
          projectId: projectId,
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (
        this.prismaToolsService.isErrorOfUniqueField<{ email: string }>(
          err,
          'email',
          true
        )
      ) {
        throw new SsoError(SsoErrorEnum.EmailIsExists);
      }
      if (
        this.prismaToolsService.isErrorOfUniqueField<{ username: string }>(
          err,
          'username',
          true
        )
      ) {
        throw new SsoError(SsoErrorEnum.UserIsExists);
      }
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  async autoSignUp(
    user: Pick<
      SsoUser,
      | 'email'
      | 'appData'
      | 'birthdate'
      | 'firstname'
      | 'lastname'
      | 'password'
      | 'picture'
      | 'roles'
      | 'username'
    >,
    projectId: string
  ) {
    const createdUser = await this.create(
      {
        ...user,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        appData: user.appData as any,
      },
      projectId
    );
    this.ssoEventsService.send({
      userId: createdUser.id,
      SignUp: {
        signUpArgs: { ...user, fingerprint: createdUser.id } as SignUpArgs,
      },
    });
    return createdUser;
  }

  async changePassword(user: Pick<SsoUser, 'id' | 'password'>) {
    const hashedPassword = await this.ssoPasswordService.createPasswordHash(
      user.password
    );
    await this.prismaClient.ssoUser.update({
      data: {
        password: hashedPassword,
      },
      where: { id: user.id },
    });
    return await this.getById(user.id);
  }

  async update(
    user: Pick<
      SsoUser,
      | 'email'
      | 'birthdate'
      | 'firstname'
      | 'lastname'
      | 'id'
      | 'password'
      | 'picture'
      | 'username'
    >,
    projectId: string
  ) {
    const updatedUser = await this.prismaClient.ssoUser.update({
      data: {
        ...user,
        projectId,
      },
      where: { id: user.id },
    });
    return this.getById(updatedUser.id);
  }
}
