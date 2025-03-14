import { faker } from '@faker-js/faker';
import { Injectable, Logger } from '@nestjs/common';
import {
  PrismaClient,
  TwoFactorCode,
  TwoFactorUser,
} from '@prisma/two-factor-client';

import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { getText } from 'nestjs-translates';
import { TwoFactorUserDto } from './generated/rest/dto/two-factor-user.dto';
import { TwoFactorEventsService } from './two-factor-events.service';
import { TwoFactorConfiguration } from './two-factor.configuration';
import { TWO_FACTOR_FEATURE } from './two-factor.constants';
import { TwoFactorError, TwoFactorErrorEnum } from './two-factor.errors';

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);

  constructor(
    @InjectPrismaClient(TWO_FACTOR_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly twoFactorConfiguration: TwoFactorConfiguration,
    private readonly twoFactorEventsService: TwoFactorEventsService
  ) {}

  async generateCode(options: {
    type: string;
    operationName: string;
    externalUserId: string;
    externalTenantId: string;
    repetition?: boolean;
  }) {
    const twoFactorUser = await this.getOrCreateUser(options);

    await this.removeOutdateTwoFactorCode(options);

    const { twoFactorCode, code } = await this.recursiveGenTwoFactorCode(
      options
    );

    await this.twoFactorEventsService.send({
      GenerateCode: {
        twoFactorUser,
        twoFactorCode,
        code,
        repetition: Boolean(options.repetition),
      },
      externalTenantId: options.externalTenantId,
      externalUserId: options.externalUserId,
      operationName: options.operationName,
      type: options.type,
    });

    return { twoFactorUser, twoFactorCode, code };
  }

  async validateCode(options: {
    operationName: string;
    code: string;
    externalTenantId: string;
  }) {
    let twoFactorCode = await this.prismaClient.twoFactorCode.findFirst({
      include: { TwoFactorUser: true },
      where: {
        used: false,
        code: { equals: options.code },
        externalTenantId: options.externalTenantId,
      },
    });
    if (!twoFactorCode) {
      throw new TwoFactorError(TwoFactorErrorEnum.TwoFactorCodeManualNotSet);
    }
    if (
      this.twoFactorConfiguration.getMaxAttemptValue &&
      this.twoFactorConfiguration.getTimeoutValue
    ) {
      const maxAttempt = this.twoFactorConfiguration.getMaxAttemptValue({
        twoFactorCode,
        twoFactorUser: twoFactorCode.TwoFactorUser,
      });
      const timeout = this.twoFactorConfiguration.getTimeoutValue({
        twoFactorCode,
        twoFactorUser: twoFactorCode.TwoFactorUser,
      });

      if (
        +new Date() - +twoFactorCode.updatedAt <= timeout &&
        twoFactorCode.attempt >= maxAttempt
      ) {
        await this.twoFactorEventsService.send({
          ValidateCodeMaxAttempt: {
            twoFactorUser: twoFactorCode.TwoFactorUser,
            twoFactorCode,
            attempt: twoFactorCode.attempt,
            maxAttempt,
            timeout,
            code: options.code,
          },
          externalTenantId: options.externalTenantId,
          externalUserId: twoFactorCode.TwoFactorUser.externalUserId,
          operationName: options.operationName,
          type: twoFactorCode.type,
        });
        throw new TwoFactorError(
          TwoFactorErrorEnum.TwoFactorCodeNumberOfAttemptsHasBeenExhausted
        );
      }

      if (+new Date() - +twoFactorCode.updatedAt > timeout) {
        if (twoFactorCode.attempt < maxAttempt) {
          await this.prismaClient.twoFactorCode.update({
            data: {
              used: true,
            },
            where: {
              id: twoFactorCode.id,
              externalTenantId: options.externalTenantId,
            },
          });
          const generateCodeResult = await this.generateCode({
            ...options,
            repetition: true,
            externalUserId: twoFactorCode.TwoFactorUser.externalUserId,
            type: twoFactorCode.type,
          });
          twoFactorCode = generateCodeResult.twoFactorCode;
        }

        throw new TwoFactorError(TwoFactorErrorEnum.TwoFactorCodeIsOutdated);
      }

      if (twoFactorCode.code !== options.code) {
        twoFactorCode = await this.prismaClient.twoFactorCode.update({
          include: { TwoFactorUser: true },
          where: {
            id: twoFactorCode.id,
            externalTenantId: options.externalTenantId,
          },
          data: { attempt: twoFactorCode.attempt + 1 },
        });

        await this.twoFactorEventsService.send({
          ValidateCodeEachAttempt: {
            twoFactorUser: twoFactorCode.TwoFactorUser,
            twoFactorCode,
            attempt: twoFactorCode.attempt,
            timeout,
            code: options.code,
          },
          externalTenantId: options.externalTenantId,
          externalUserId: twoFactorCode.TwoFactorUser.externalUserId,
          operationName: options.operationName,
          type: twoFactorCode.type,
        });

        throw new TwoFactorError(TwoFactorErrorEnum.TwoFactorCodeWrongCode);
      }
    }
    await this.prismaClient.twoFactorCode.update({
      data: {
        used: true,
      },
      where: {
        id: twoFactorCode.id,
        externalTenantId: options.externalTenantId,
      },
    });
    return { twoFactorUser: twoFactorCode.TwoFactorUser, twoFactorCode };
  }

  private async recursiveGenTwoFactorCode(
    options: {
      type: string;
      operationName: string;
      externalUserId: string;
      externalTenantId: string;
    },
    depth = 10
  ): Promise<{
    twoFactorCode: TwoFactorCode & { TwoFactorUser: TwoFactorUser };
    code: string;
  }> {
    if (depth < 0) {
      throw new TwoFactorError(
        getText(
          'recursive method recursiveGenTwoFactorCode has been run more than 10 times'
        ),
        TwoFactorErrorEnum.COMMON
      );
    }
    try {
      const code = String(faker.number.int({ min: 100000, max: 999999 }));

      const twoFactorCode = await this.prismaClient.twoFactorCode.create({
        include: { TwoFactorUser: true },
        data: {
          attempt: 0,
          code,
          externalTenantId: options.externalTenantId,
          operationName: options.operationName,
          type: options.type,
          TwoFactorUser: {
            connect: {
              externalTenantId_externalUserId: {
                externalUserId: options.externalUserId,
                externalTenantId: options.externalTenantId,
              },
            },
          },
          used: false,
        },
      });
      return { twoFactorCode, code };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
      return this.recursiveGenTwoFactorCode(options, depth - 1);
    }
  }

  private async getOrCreateUser(options: {
    externalUserId: string;
    externalTenantId: string;
  }): Promise<TwoFactorUserDto> {
    return await this.prismaClient.twoFactorUser.upsert({
      create: {
        externalTenantId: options.externalTenantId,
        externalUserId: options.externalUserId,
      },
      update: {},
      where: {
        externalTenantId_externalUserId: {
          externalTenantId: options.externalTenantId,
          externalUserId: options.externalUserId,
        },
      },
    });
  }

  private async removeOutdateTwoFactorCode(options: {
    externalUserId: string;
    externalTenantId: string;
  }) {
    const twoFactorCodes = await this.prismaClient.twoFactorCode.findMany({
      include: { TwoFactorUser: true },
      where: {
        TwoFactorUser: {
          externalTenantId: { equals: options.externalTenantId },
          externalUserId: { equals: options.externalUserId },
        },
        used: { equals: false },
        externalTenantId: options.externalTenantId,
      },
    });

    const itemIdsForDelete = twoFactorCodes
      .filter(
        (twoFactorCode) =>
          this.twoFactorConfiguration.getTimeoutValue &&
          +new Date() - +twoFactorCode.updatedAt >
            this.twoFactorConfiguration.getTimeoutValue({
              twoFactorCode,
              twoFactorUser: twoFactorCode.TwoFactorUser,
            })
      )
      .map((item) => item.id);

    await this.prismaClient.twoFactorCode.updateMany({
      data: {
        used: true,
      },
      where: {
        id: { in: itemIdsForDelete },
        externalTenantId: options.externalTenantId,
      },
    });
  }
}
