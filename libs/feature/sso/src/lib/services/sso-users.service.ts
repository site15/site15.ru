import { searchIn } from '@nestjs-mod/misc';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaToolsService } from '@nestjs-mod/prisma-tools';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma-client';
import { CreateSsoUserDto } from '../generated/rest/dto/create-sso-user.dto';
import { SsoUser } from '../generated/rest/dto/sso-user.entity';
import { SSO_FEATURE } from '../sso.constants';
import { SsoStaticEnvironments } from '../sso.environments';
import { SsoError, SsoErrorEnum } from '../sso.errors';
import { SsoCacheService } from './sso-cache.service';
import { SsoPasswordService } from './sso-password.service';
import { SsoTenantService } from './sso-tenant.service';

@Injectable()
export class SsoUsersService {
  private readonly logger = new Logger(SsoUsersService.name);

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly ssoPasswordService: SsoPasswordService,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly ssoCacheService: SsoCacheService,
    private readonly ssoTenantService: SsoTenantService,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
  ) {}

  async createAdmin() {
    if (this.ssoStaticEnvironments.adminEmail && this.ssoStaticEnvironments.adminPassword) {
      try {
        const signupUserResult = await this.create({
          user: {
            username: this.ssoStaticEnvironments.adminUsername,
            password: this.ssoStaticEnvironments.adminPassword,
            email: this.ssoStaticEnvironments.adminEmail,
          },
          roles: this.ssoStaticEnvironments.adminDefaultRoles,
        });

        await this.prismaClient.ssoUser.update({
          data: { emailVerifiedAt: new Date() },
          where: {
            id: signupUserResult.id,
          },
        });

        await this.ssoCacheService.clearCacheByUserId({
          userId: signupUserResult.id,
        });

        this.logger.debug(`Admin with email: ${signupUserResult.email} successfully created!`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!(err instanceof SsoError && err.code === SsoErrorEnum.EmailIsExists)) {
          this.logger.error(err, err.stack);
        }
      }
    }
  }

  async getByEmail({ email, tenantId }: { email: string; tenantId: string }) {
    try {
      return await this.prismaClient.ssoUser.findUniqueOrThrow({
        include: { SsoTenant: true },
        where: { tenantId_email: { email, tenantId } },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (this.prismaToolsService.isErrorOfRecordNotFound(err)) {
        throw new SsoError(SsoErrorEnum.UserNotFound);
      }
      this.logger.debug({
        getByEmail: {
          email,
          tenantId,
        },
      });
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  async getById({ id, tenantId }: { id: string; tenantId: string }) {
    try {
      return await this.prismaClient.ssoUser.findUniqueOrThrow({
        include: { SsoTenant: true },
        where: { id, tenantId },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.debug({
        getById: {
          id,
          tenantId,
        },
      });
      if (this.prismaToolsService.isErrorOfRecordNotFound(err)) {
        return this.getAdminById({ id });
      }
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  async getAdminById({ id }: { id: string }) {
    const OR =
      this.ssoStaticEnvironments.adminDefaultRoles?.map((r) => ({
        roles: {
          contains: r,
        },
      })) || [];
    try {
      return await this.prismaClient.ssoUser.findUniqueOrThrow({
        include: { SsoTenant: true },
        where: {
          id,
          ...(OR.length ? { OR } : {}),
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.debug({
        getAdminById: {
          id,
        },
        OR,
      });
      if (this.prismaToolsService.isErrorOfRecordNotFound(err)) {
        throw new SsoError(SsoErrorEnum.UserNotFound);
      }
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  async getAdminByEmailAndPassword({ email, password }: { email: string; password: string }) {
    const OR =
      this.ssoStaticEnvironments.adminDefaultRoles?.map((r) => ({
        roles: {
          contains: r,
        },
      })) || [];
    try {
      const user = await this.prismaClient.ssoUser.findFirstOrThrow({
        include: { SsoTenant: true },
        where: { email, ...(OR.length ? { OR } : {}) },
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
        this.logger.debug({ getAdminByEmailAndPassword: { email }, OR });
        throw new SsoError(SsoErrorEnum.UserNotFound);
      }
      this.logger.debug({
        getAdminByEmailAndPassword: { email, password },
      });
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  async getByEmailAndPassword({ email, password, tenantId }: { email: string; password: string; tenantId: string }) {
    try {
      const user = await this.prismaClient.ssoUser.findUniqueOrThrow({
        include: { SsoTenant: true },
        where: { tenantId_email: { email, tenantId } },
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
        this.logger.debug({
          getByEmailAndPassword: {
            email,
            tenantId,
          },
        });
        return this.getAdminByEmailAndPassword({ email, password });
      }
      this.logger.debug({
        getByEmailAndPassword: { email, password, tenantId },
      });
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  async create({ user, tenantId, roles }: { user: CreateSsoUserDto; tenantId?: string; roles?: string[] }) {
    if (roles?.length && !searchIn(roles, this.ssoStaticEnvironments.userAvailableRoles)) {
      this.logger.debug({
        create: {
          user,
          tenantId,
          roles,
        },
        userAvailableRoles: this.ssoStaticEnvironments.userAvailableRoles,
        result: searchIn(roles, this.ssoStaticEnvironments.userAvailableRoles),
      });
      throw new SsoError(SsoErrorEnum.NonExistentRoleSpecified);
    }

    const hashedPassword = await this.ssoPasswordService.createPasswordHash(user.password);

    try {
      const result = await this.prismaClient.ssoUser.create({
        include: { SsoTenant: true },
        data: {
          ...user,
          ...(user.email
            ? {
                email: user.email.toLowerCase(),
              }
            : {}),
          username: user.username,
          password: hashedPassword,
          SsoTenant: {
            connect: tenantId
              ? { id: tenantId }
              : {
                  clientId: (await this.ssoTenantService.getOrCreateDefaultTenant())?.clientId,
                },
          },
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
      if (this.prismaToolsService.isErrorOfUniqueField<{ email: string }>(err, 'email', true)) {
        throw new SsoError(SsoErrorEnum.EmailIsExists);
      }
      if (this.prismaToolsService.isErrorOfUniqueField<{ username: string }>(err, 'username', true)) {
        throw new SsoError(SsoErrorEnum.UserIsExists);
      }
      if (this.prismaToolsService.isErrorOfUniqueFields(err, ['"tenantId"', 'email'], true)) {
        throw new SsoError(SsoErrorEnum.UserIsExists);
      }
      this.logger.debug({
        create: {
          user,
          tenantId,
        },
      });
      this.logger.error(err, err.stack);
      throw err;
    }
  }

  async changePassword({ id, password, tenantId }: { id: string; password: string; tenantId: string }) {
    const hashedPassword = await this.ssoPasswordService.createPasswordHash(password);

    const user = await this.prismaClient.ssoUser.findFirst({
      select: { emailVerifiedAt: true },
      where: { id, tenantId },
    });

    await this.prismaClient.ssoUser.update({
      data: {
        password: hashedPassword,
        ...(!user?.emailVerifiedAt ? { updatedAt: new Date() } : {}),
      },
      where: { id, tenantId },
    });

    await this.ssoCacheService.clearCacheByUserId({ userId: id });

    return await this.getById({ id, tenantId });
  }

  async update({
    user,
    tenantId,
  }: {
    user: Pick<SsoUser, 'birthdate' | 'firstname' | 'lastname' | 'id' | 'picture' | 'gender' | 'lang' | 'timezone'> & {
      password: string | null;
      oldPassword: string | null;
    };
    tenantId: string;
  }) {
    const { password, oldPassword, lang, timezone, birthdate, firstname, gender, lastname, picture } = user;
    if (password) {
      const currentUser = await this.prismaClient.ssoUser.findFirst({
        include: { SsoTenant: true },
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
      include: { SsoTenant: true },
      data: {
        birthdate,
        firstname,
        gender,
        lastname,
        picture,
        tenantId,
        ...(user.password
          ? {
              password: await this.ssoPasswordService.createPasswordHash(user.password),
            }
          : {}),
        ...(lang === undefined
          ? {}
          : {
              lang,
            }),
        ...(timezone === undefined
          ? {}
          : {
              timezone,
            }),
        updatedAt: new Date(),
      },
      where: { id: user.id },
    });

    await this.ssoCacheService.clearCacheByUserId({ userId: updatedUser.id });

    return this.getById({ id: updatedUser.id, tenantId });
  }
}
