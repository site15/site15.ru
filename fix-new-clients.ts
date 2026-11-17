import { readFileSync, writeFileSync } from 'node:fs';

// После `prisma generate` у клиента с previewFeatures=["queryCompiler","driverAdapters"]
// загрузчик WASM выглядит как `require.resolve("@prisma/client/runtime/...wasm")`.
// Webpack (apps/server/webpack.config.js собирает workers/*.worker.ts отдельными
// entry points) сворачивает такой require.resolve в числовой id модуля, и форк-
// воркеры статистики падали с ERR_INVALID_ARG_TYPE на readFile(<number>) — счётчики
// лендинга не обновлялись вообще. Правим на `(await import('node:path')).resolve("node_modules/...")`
// — литерал, который webpack не трогает, путь разрешается в рантайме.
// Список должен покрывать ВСЕ сгенерированные клиенты, использующие queryCompiler.
const files2: string[] = [
  'libs/feature/sso/src/lib/generated/prisma-client/internal/class.ts',
  'libs/feature/metrics/src/lib/generated/prisma-client/internal/class.ts',
];
for (let file of files2) {
  writeFileSync(
    file,
    readFileSync(file)
      .toString()
      .split('("@prisma/client/runtime')
      .join('("node_modules/@prisma/client/runtime')
      .split('require.resolve(')
      .join("(await import('node:path')).resolve("),
  );
}
