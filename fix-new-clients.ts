import { readFileSync, writeFileSync } from 'node:fs';

const files2: string[] = [
  'libs/core/notifications/src/lib/generated/prisma-client/internal/class.ts',
  'libs/core/sso/src/lib/generated/prisma-client/internal/class.ts',
  'libs/core/two-factor/src/lib/generated/prisma-client/internal/class.ts',
  'libs/core/webhook/src/lib/generated/prisma-client/internal/class.ts',
];
for (let file of files2) {
  writeFileSync(
    file,
    readFileSync(file)
      .toString()
      .split('("@prisma/client/runtime')
      .join('("node_modules/@prisma/client/runtime')
      .split('require.resolve(')
      .join("(await import('node:path')).resolve(")
  );
}
