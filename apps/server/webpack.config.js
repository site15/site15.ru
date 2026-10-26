const { composePlugins, withNx } = require('@nx/webpack');
const path = require('path');

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx({
    sourceMap: true,
    target: 'node',
  }),
  (config) => {
    // Update the webpack config as needed here.
    // e.g. config.plugins.push(new MyPlugin())
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Добавляем worker scripts как дополнительные entry points
    // Они будут скомпилированы в dist/apps/server/workers/
    config.entry = {
      ...config.entry,
      'workers/sync-stats.worker': path.resolve(__dirname, 'src/workers/sync-stats.worker.ts'),
      'workers/refresh-video-stats.worker': path.resolve(__dirname, 'src/workers/refresh-video-stats.worker.ts'),
    };

    config.module.rules = [
      ...config.module.rules,
      {
        test: /\.(ts)$/,
        loader: 'string-replace-loader',
        options: {
          search: `class-validator`,
          replace: `class-validator-multi-lang`,
          flags: 'g',
        },
      },
      {
        test: /\.(ts)$/,
        loader: 'string-replace-loader',
        options: {
          search: 'class-transformer',
          replace: 'class-transformer-global-storage',
          flags: 'g',
        },
      },
      {
        test: /\.(js)$/,
        loader: 'string-replace-loader',
        options: {
          search: `class-validator`,
          replace: `class-validator-multi-lang`,
          flags: 'g',
        },
      },
      {
        test: /\.(js)$/,
        loader: 'string-replace-loader',
        options: {
          search: 'class-transformer',
          replace: 'class-transformer-global-storage',
          flags: 'g',
        },
      },
    ];
    return config;
  },
);
