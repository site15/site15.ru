import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/sso-client';
import { SsoError } from './sso.errors';

export const SsoEntities = class {};

Object.keys(Prisma)
  .filter(
    (key) => key.endsWith('ScalarFieldEnum') && !key.startsWith('Migrations')
  )
  .map((enumName: string) => {
    const keyOfEntity = enumName.split('ScalarFieldEnum')[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (SsoEntities as any)['prototype'][keyOfEntity] = '';
    ApiProperty({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      enum: (Prisma as any)[enumName],
      enumName: enumName,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })((SsoEntities as any)['prototype'], keyOfEntity);
  });

export const SSO_EXTRA_MODELS = [SsoError, SsoEntities];
