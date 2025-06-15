import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from './generated/prisma-client';
import { SsoError } from './sso.errors';
import { SsoRole } from './types/sso-role';

export const SsoEntities = class {
  role!: SsoRole;
};

Object.keys(Prisma)
  .filter((key) => key.endsWith('ScalarFieldEnum') && !key.startsWith('Migrations'))
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

ApiProperty({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enum: SsoRole,
  enumName: 'SsoRole',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
})((SsoEntities as any)['prototype'], 'role');

export const SSO_EXTRA_MODELS = [SsoError, SsoEntities];
