import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable } from '@nestjs/common';
import omit from 'lodash/fp/omit';
import { randomUUID } from 'node:crypto';
import { CreateMetricsUserDto } from '../generated/rest/dto/create-metrics-user.dto';
import { METRICS_FEATURE } from '../metrics.constants';
import { MetricsPrismaSdk, MetricsRole } from '../metrics.prisma-sdk';

@Injectable()
export class MetricsUsersService {
  constructor(
    @InjectPrismaClient(METRICS_FEATURE)
    private readonly prismaClient: MetricsPrismaSdk.PrismaClient,
  ) {}

  async createUserIfNotExists(user: Omit<CreateMetricsUserDto, 'id'>) {
    const data = {
      externalTenantId: randomUUID(),
      userRole: MetricsRole.User,
      ...omit(['id', 'createdAt', 'updatedAt'], user),
    } as CreateMetricsUserDto;
    const existsUser = await this.prismaClient.metricsUser.findFirst({
      where: {
        tenantId: user.tenantId,
        externalUserId: user.externalUserId,
      },
    });
    if (!existsUser) {
      return await this.prismaClient.metricsUser.create({
        data,
      });
    }
    return existsUser;
  }
}
