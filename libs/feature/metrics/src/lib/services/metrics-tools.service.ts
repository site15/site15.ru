import { Injectable } from '@nestjs/common';
import { MetricsRole } from '../generated/prisma-client';
import { MetricsUserDto } from '../generated/rest/dto/metrics-user.dto';

@Injectable()
export class MetricsToolsService {
  externalTenantIdQuery(
    metricsUser: Pick<MetricsUserDto, 'userRole' | 'tenantId'> | null,
    tenantId?: string,
  ): {
    tenantId: string;
  } {
    const q =
      metricsUser?.userRole === MetricsRole.User
        ? {
            tenantId: metricsUser.tenantId,
          }
        : { tenantId };
    if (!q.tenantId) {
      return {} as {
        tenantId: string;
      };
    }
    return q as {
      tenantId: string;
    };
  }
}
