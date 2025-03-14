import { PrismaToolsService } from '@nestjs-mod-sso/prisma-tools';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/sso-client';
import { CreateSsoUserDto } from '../generated/rest/dto/create-sso-user.dto';
import { SsoUser } from '../generated/rest/dto/sso-user.entity';
import { SSO_FEATURE } from '../sso.constants';
import { SsoStaticEnvironments } from '../sso.environments';
import { SsoError, SsoErrorEnum } from '../sso.errors';
import { SsoCacheService } from './sso-cache.service';
import { SsoPasswordService } from './sso-password.service';

@Injectable()
export class SsoUsersService {
  private readonly logger = new Logger(SsoUsersService.name);

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly ssoPasswordService: SsoPasswordService,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly ssoCacheService: SsoCacheService,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments
  ) {}

  async getByEmail({ email, projectId }: { email: string; projectId: string }) {
    try {
      return await this.prismaClient.ssoUser.findUniqueOrThrow({
        where: { email_projectId: { email, projectId } },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (this.prismaToolsService.isErrorOfRecordNotFound(err)) {
        throw new SsoError(SsoErrorEnum.UserNotFound);
      }
      this.logger.debug({
        getByEmail: {
          email,
          projectId,
        },
      });
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  async getById({ id, projectId }: { id: string; projectId: string }) {
    try {
      return await this.prismaClient.ssoUser.findUniqueOrThrow({
        where: { id, projectId },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.debug({
        getById: {
          id,
          projectId,
        },
      });
      if (this.prismaToolsService.isErrorOfRecordNotFound(err)) {
        throw new SsoError(SsoErrorEnum.UserNotFound);
      }
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  async getByEmailAndPassword({
    email,
    password,
    projectId,
  }: {
    email: string;
    password: string;
    projectId: string;
  }) {
    try {
      const user = await this.prismaClient.ssoUser.findUniqueOrThrow({
        where: { email_projectId: { email, projectId } },
      });
      if (
        !(await this.ssoPasswordService.comparePasswordWithHash({
          password,
          hashedPassword: user.password,
        }))
      ) {
        throw new SsoError(SsoErrorEnum.WrongPassword);
      }
      return user;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (this.prismaToolsService.isErrorOfRecordNotFound(err)) {
        this.logger.debug({ getByEmailAndPassword: { email, projectId } });
        throw new SsoError(SsoErrorEnum.UserNotFound);
      }
      this.logger.debug({
        getByEmailAndPassword: { email, password, projectId },
      });
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  async create({
    user,
    projectId,
    roles,
  }: {
    user: CreateSsoUserDto;
    projectId: string;
    roles?: string[];
  }) {
    if (
      roles?.length &&
      !roles.find((r) =>
        this.ssoStaticEnvironments.userAvailableRoles?.includes(r)
      )
    ) {
      this.logger.debug({
        create: {
          user,
          projectId,
          roles,
        },
        userAvailableRoles: this.ssoStaticEnvironments.userAvailableRoles,
        result: roles.find((r) =>
          this.ssoStaticEnvironments.userAvailableRoles?.includes(r)
        ),
      });
      throw new SsoError(SsoErrorEnum.NonExistentRoleSpecified);
    }

    const hashedPassword = await this.ssoPasswordService.createPasswordHash(
      user.password
    );
    try {
      const result = await this.prismaClient.ssoUser.create({
        data: {
          ...user,
          username: user.username,
          password: hashedPassword,
          projectId: projectId,
          roles: roles ? roles.join(',') : null,
        },
      });

      // fill cache
      await this.ssoCacheService.getCachedUser({
        userId: result.id,
      });

      return result;
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
      this.logger.debug({
        create: {
          user,
          projectId,
        },
      });
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  async changePassword({
    id,
    password,
    projectId,
  }: {
    id: string;
    password: string;
    projectId: string;
  }) {
    const hashedPassword = await this.ssoPasswordService.createPasswordHash(
      password
    );

    await this.prismaClient.ssoUser.update({
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
      where: { id, projectId },
    });

    await this.ssoCacheService.clearCacheByUserId({ userId: id });

    return await this.getById({ id, projectId });
  }

  async update({
    user,
    projectId,
  }: {
    user: Pick<
      SsoUser,
      'birthdate' | 'firstname' | 'lastname' | 'id' | 'picture' | 'gender'
    > & { password: string | null; oldPassword: string | null };
    projectId: string;
  }) {
    const { password, oldPassword, ...profile } = user;
    if (password) {
      const currentUser = await this.prismaClient.ssoUser.findFirst({
        where: { id: user.id },
      });

      if (
        currentUser &&
        !(await this.ssoPasswordService.comparePasswordWithHash({
          password: oldPassword || '',
          hashedPassword: currentUser.password,
        }))
      ) {
        throw new SsoError(SsoErrorEnum.WrongOldPassword);
      }

      if (
        currentUser &&
        (await this.ssoPasswordService.comparePasswordWithHash({
          password,
          hashedPassword: currentUser.password,
        }))
      ) {
        user.password = null;
      }
    }
    const updatedUser = await this.prismaClient.ssoUser.update({
      data: {
        ...profile,
        projectId,
        ...(user.password
          ? {
              password: await this.ssoPasswordService.createPasswordHash(
                user.password
              ),
            }
          : {}),
        updatedAt: new Date(),
      },
      where: { id: user.id },
    });

    await this.ssoCacheService.clearCacheByUserId({ userId: updatedUser.id });

    return this.getById({ id: updatedUser.id, projectId });
  }
}
