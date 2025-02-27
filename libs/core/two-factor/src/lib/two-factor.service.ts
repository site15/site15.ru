import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
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
    } catch (err) {
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

  /*
  validate(req: any) {
    const operationName = req?.body?.operationName || '';
    const originalUrl =
      (req?.body?.operationName ? null : req?.originalUrl) || '';

    return this.validateTwoFactorCode({
      user: req.user,
      operationName,
      originalUrl,
      checkCode: req?.headers?.[TWO_FACTOR_CODE_HEADER_NAME],
    });
  }

  generate(req: any) {
    const operationName = req?.body?.operationName || '';
    const originalUrl =
      (req?.body?.operationName ? null : req?.originalUrl) || '';
    const user = req.user;
    return this.generateTwoFactorCode({
      user,
      operationName,
      originalUrl,
    });
  }

  intercept(req: any) {
    //
    if (
      req?.body?.operationName &&
      Object.keys(this.twoFactorConfig.graphql?.operationNames || {}).includes(
        req?.body?.operationName
      )
    ) {
      if (!req?.headers?.[TWO_FACTOR_CODE_HEADER_NAME]) {
        return this.generate(req).pipe(
          mergeMap((twoFactorCode) => {
            return this.sendConfirmCodeToMail({
              user: req?.user,
              twoFactorCode,
            });
          }),
          mergeMap(() =>
            throwError(
              () => new TwoFactorError(TwoFactorErrorsEnum.TwoFactorCodeNotSet)
            )
          ),
          catchError((err) => {
            if (
              ErrorOfUniqueFields<TwoFactorCodes>(
                err,
                [`userId`, `operationName`, `originalUrl`],
                true
              )
            ) {
              return throwError(
                () =>
                  new TwoFactorError(TwoFactorErrorsEnum.TwoFactorCodeNotSet)
              );
            }
            return throwError(() => err);
          }),
          mapTo(null)
        );
      }
      return this.validate(req).pipe(mapTo(null));
    } else {
      if (
        req?.body?.operationName &&
        Object.keys(
          this.twoFactorConfig.graphql?.manualValidateOperationNames || {}
        ).includes(req?.body?.operationName) &&
        req?.headers?.[TWO_FACTOR_CODE_HEADER_NAME]
      ) {
        return this.validate({
          ...req,
          headers: {
            ...req?.headers,
            checkCode: req?.headers?.[TWO_FACTOR_CODE_HEADER_NAME],
          },
        }).pipe(mapTo(null));
      }
    }

    //
    if (
      req?.originalUrl &&
      Object.keys(this.twoFactorConfig.rest?.originalUrls || {}).includes(
        req?.originalUrl
      )
    ) {
      if (!req?.headers?.[TWO_FACTOR_CODE_HEADER_NAME]) {
        return this.generate(req).pipe(
          mergeMap((twoFactorCode) => {
            return this.sendConfirmCodeToMail({
              user: req?.user,
              twoFactorCode,
            });
          }),
          mergeMap(() =>
            throwError(
              () => new TwoFactorError(TwoFactorErrorsEnum.TwoFactorCodeNotSet)
            )
          ),
          catchError((err) => {
            if (
              ErrorOfUniqueFields<TwoFactorCodes>(
                err,
                [`userId`, `operationName`, `originalUrl`],
                true
              )
            ) {
              return throwError(
                () =>
                  new TwoFactorError(TwoFactorErrorsEnum.TwoFactorCodeNotSet)
              );
            }
            return throwError(() => err);
          }),
          mapTo(null)
        );
      }
      return this.validate({
        ...req,
        headers: {
          ...req?.headers,
          checkCode: req?.headers?.[TWO_FACTOR_CODE_HEADER_NAME],
        },
      }).pipe(mapTo(null));
    } else {
      if (
        req?.originalUrl &&
        Object.keys(
          this.twoFactorConfig.rest?.manualValidateOriginalUrls || {}
        ).includes(req?.originalUrl) &&
        req?.headers?.[TWO_FACTOR_CODE_HEADER_NAME]
      ) {
        return this.validate(req).pipe(mapTo(null));
      }
    }
    return of(null);
  }

  generateTwoFactorCode(options: {
    user: CurrentUserType;
    originalUrl: string;
    operationName: string;
  }) {
    return forkJoin({
      code: from(randomNumber(100000, 999999)),
      removeOutdateTwoFactorCode: this.removeOutdateTwoFactorCode(options),
    }).pipe(
      mergeMap(({ code }) => {
        const twoFactorCode =
          Object.keys(this.twoFactorConfig.rest?.originalUrls || {})
            .filter(
              (configOriginalUrl) => configOriginalUrl === options.originalUrl
            )
            .map(
              (configOriginalUrl) =>
                this.twoFactorConfig.rest?.originalUrls?.[configOriginalUrl]
            )[0] ||
          Object.keys(this.twoFactorConfig.graphql?.operationNames || {})
            .filter(
              (configOperationName) =>
                configOperationName === options.operationName
            )
            .map(
              (configOperationName) =>
                this.twoFactorConfig.graphql?.operationNames?.[
                  configOperationName
                ]
            )[0] ||
          Object.keys(
            this.twoFactorConfig.rest?.manualValidateOriginalUrls || {}
          )
            .filter(
              (configOriginalUrl) => configOriginalUrl === options.originalUrl
            )
            .map(
              (configOriginalUrl) =>
                this.twoFactorConfig.rest?.manualValidateOriginalUrls?.[
                  configOriginalUrl
                ]
            )[0] ||
          Object.keys(
            this.twoFactorConfig.graphql?.manualValidateOperationNames || {}
          )
            .filter(
              (configOperationName) =>
                configOperationName === options.operationName
            )
            .map(
              (configOperationName) =>
                this.twoFactorConfig.graphql?.manualValidateOperationNames?.[
                  configOperationName
                ]
            )[0] ||
          null;

        if (!twoFactorCode) {
          this.logger.error(
            `twoFactorCode not set in request for options: ${JSON.stringify(
              options
            )}`
          );
          return throwError(
            () => new Error('twoFactorCode not set in request')
          );
        }
        return from(
          this.sdkPrismaService.twoFactorCodes.upsert({
            create: {
              ...omitObject(options, ['user']),
              userId: options.user.id,
              code: String(code),
              ...twoFactorCode,
              attempt: 0,
            },
            update: { code: String(code) },
            where: {
              userId_operationName_originalUrl: {
                userId: options.user.id,
                operationName: options.operationName,
                originalUrl: options.originalUrl,
              },
            },
          })
        );
      })
    );
  }

  sendConfirmCodeToMail(options: {
    user: CurrentUserType;
    twoFactorCode: TwoFactorCodes;
  }) {
    return this.mailService.sendMail({
      to: options.user.email,
      subject: options.twoFactorCode.subject || 'Confirm request 2FA code',
      html: [
        `Confirm your request: ${options.twoFactorCode.code}`,
        `Max attempts: ${options.twoFactorCode.maxAttempt}`,
        `Timeout: ${options.twoFactorCode.timeout}`,
      ].join('<br/>'),
    });
  }

  removeOutdateTwoFactorCode(options: {
    user: CurrentUserType;
    originalUrl: string;
    operationName: string;
  }) {
    return from(
      this.sdkPrismaService.twoFactorCodes.findFirst({
        where: { ...omitObject(options, ['user']), userId: options.user.id },
        rejectOnNotFound: false,
      })
    ).pipe(
      mergeMap((twoFactorCode) => {
        if (
          twoFactorCode &&
          +new Date() - +twoFactorCode.updatedAt > twoFactorCode.timeout
        ) {
          return from(
            this.sdkPrismaService.twoFactorCodes.delete({
              where: { id: twoFactorCode.id },
            })
          ).pipe(mapTo(twoFactorCode));
        }
        return of(twoFactorCode);
      })
    );
  }

  validateTwoFactorCode(options: {
    user: CurrentUserType;
    originalUrl: string;
    operationName: string;
    checkCode: string;
  }) {
    return from(
      this.sdkPrismaService.twoFactorCodes.findUnique({
        where: {
          userId_operationName_originalUrl: {
            ...omitObject(options, ['checkCode', 'user']),
            userId: options.user.id,
          },
        },
        rejectOnNotFound: true,
      })
    ).pipe(
      mergeMap((twoFactorCode) => {
        if (
          +new Date() - +twoFactorCode.updatedAt <= twoFactorCode.timeout &&
          twoFactorCode.attempt >= twoFactorCode.maxAttempt
        ) {
          return throwError(
            () =>
              new TwoFactorError(
                TwoFactorErrorsEnum.TwoFactorCodeNumberOfAttemptsHasBeenExhausted
              )
          );
        }
        if (+new Date() - +twoFactorCode.updatedAt > twoFactorCode.timeout) {
          if (twoFactorCode.attempt < twoFactorCode.maxAttempt) {
            return from(
              this.sdkPrismaService.twoFactorCodes.delete({
                where: { id: twoFactorCode.id },
              })
            ).pipe(
              mergeMap(() =>
                this.generateTwoFactorCode(omitObject(options, ['checkCode']))
              ),
              mergeMap((twoFactorCode) => {
                return this.sendConfirmCodeToMail({
                  user: options.user,
                  twoFactorCode,
                });
              }),
              mergeMap(() =>
                throwError(
                  () =>
                    new TwoFactorError(
                      TwoFactorErrorsEnum.TwoFactorCodeIsOutdated
                    )
                )
              )
            );
          }
          return throwError(
            () =>
              new TwoFactorError(TwoFactorErrorsEnum.TwoFactorCodeIsOutdated)
          );
        }
        if (twoFactorCode.code !== options.checkCode) {
          return from(
            this.sdkPrismaService.twoFactorCodes.update({
              where: { id: twoFactorCode.id },
              data: { attempt: twoFactorCode.attempt + 1 },
            })
          ).pipe(
            mergeMap(() =>
              throwError(
                () =>
                  new TwoFactorError(TwoFactorErrorsEnum.TwoFactorCodeWrongCode)
              )
            )
          );
        }
        return from(
          this.sdkPrismaService.twoFactorCodes.delete({
            where: { id: twoFactorCode.id },
          })
        ).pipe(mapTo(twoFactorCode));
      })
    );
  }

  validateOnlyTwoFactorCode(code: string) {
    return from(
      this.sdkPrismaService.twoFactorCodes.findFirst({
        where: { code },
        rejectOnNotFound: true,
      })
    ).pipe(
      mergeMap((twoFactorCode) => {
        if (
          +new Date() - +twoFactorCode.updatedAt <= twoFactorCode.timeout &&
          twoFactorCode.attempt >= twoFactorCode.maxAttempt
        ) {
          return throwError(
            () =>
              new TwoFactorError(
                TwoFactorErrorsEnum.TwoFactorCodeNumberOfAttemptsHasBeenExhausted
              )
          );
        }
        if (+new Date() - +twoFactorCode.updatedAt > twoFactorCode.timeout) {
          if (twoFactorCode.attempt < twoFactorCode.maxAttempt) {
            return from(
              this.sdkPrismaService.twoFactorCodes.delete({
                where: { id: twoFactorCode.id },
              })
            ).pipe(
              mergeMap(() =>
                throwError(
                  () =>
                    new TwoFactorError(
                      TwoFactorErrorsEnum.TwoFactorCodeIsOutdated
                    )
                )
              )
            );
          }
          return throwError(
            () =>
              new TwoFactorError(TwoFactorErrorsEnum.TwoFactorCodeIsOutdated)
          );
        }
        if (twoFactorCode.code !== code) {
          return from(
            this.sdkPrismaService.twoFactorCodes.update({
              where: { id: twoFactorCode.id },
              data: { attempt: twoFactorCode.attempt + 1 },
            })
          ).pipe(
            mergeMap(() =>
              throwError(
                () =>
                  new TwoFactorError(TwoFactorErrorsEnum.TwoFactorCodeWrongCode)
              )
            )
          );
        }
        return from(
          this.sdkPrismaService.twoFactorCodes.delete({
            where: { id: twoFactorCode.id },
          })
        ).pipe(mapTo(twoFactorCode));
      })
    );
  }*/
}
