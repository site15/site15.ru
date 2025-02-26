import { AuthConfiguration, AuthRequest, AuthUser } from '@nestjs-mod-sso/auth';
import { SSO_FEATURE, SsoUsersService } from '@nestjs-mod-sso/sso';
import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/sso-client';

@Injectable()
export class SsoAuthConfiguration implements AuthConfiguration {
  private logger = new Logger(SsoAuthConfiguration.name);

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly ssoService: SsoUsersService
  ) {}

  async checkAccessValidator(
    authUser?: AuthUser | null,
    ctx?: ExecutionContext
  ) {
    const req: AuthRequest = ctx && getRequestFromExecutionContext(ctx);

    if (
      typeof ctx?.getClass === 'function' &&
      typeof ctx?.getHandler === 'function' &&
      ctx?.getClass().name === 'TerminusHealthCheckController' &&
      ctx?.getHandler().name === 'check'
    ) {
      req.skipEmptyAuthUser = true;
    }
  }

  async createAdmin(user: {
    username?: string;
    password: string;
    email: string;
  }): Promise<void | null> {
    const adminProject = await this.prismaClient.ssoProject.upsert({
      create: { clientId: user.email, clientSecret: user.password },
      update: {},
      where: { clientId: user.email },
    });

    try {
      const signupUserResult = await this.ssoService.create({
        user: {
          username: user.username,
          password: user.password,
          email: user.email.toLowerCase(),
        },
        projectId: adminProject.id,
      });

      if (signupUserResult.roles === 'admin') {
        await this.prismaClient.ssoUser.update({
          data: { roles: 'admin' },
          where: {
            email_projectId: {
              email: user.email,
              projectId: adminProject.id,
            },
          },
        });
      }
      this.logger.debug(
        `Admin with email: ${signupUserResult.email} successfully created!`
      );
    } catch (err) {
      //
    }
  }
}
