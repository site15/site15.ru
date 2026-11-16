import { ChildProcess, fork } from 'child_process';
import { Logger } from '@nestjs/common';
import { existsSync } from 'fs';

/**
 * Запуск фоновых worker-скриптов статистики из основного процесса.
 *
 * Воркеры собираются webpack'ом как отдельные entry points
 * (apps/server/webpack.config.js) и лежат рядом с main.js: dist/apps/server/workers.
 * Любой сбой запуска для пользователя лендинга невидим: статистика просто
 * перестаёт обновляться, и у свежедобавленного видео счётчики по всем площадкам
 * остаются нулевыми. Поэтому запуск обёрнут в явные проверки:
 *  - файл воркера должен существовать (иначе fork падает асинхронным 'error');
 *  - пока предыдущий экземпляр жив, новый не поднимаем — интервал опроса короче
 *    длительности загрузки площадки, и без этого копились бы процессы;
 *  - код выхода и ошибка пишутся в лог, чтобы причина была видна в PM2/docker.
 */
export class StatsWorkerLauncher {
  private child: ChildProcess | null = null;

  constructor(
    private readonly logger: Logger,
    private readonly label: string,
  ) {}

  /** @returns true, если воркер реально запущен. */
  spawn(workerPath: string): boolean {
    if (this.isRunning()) {
      this.logger.debug(`${this.label}: предыдущий worker ещё работает, запуск пропущен`);
      return false;
    }

    if (!existsSync(workerPath)) {
      this.logger.error(
        `${this.label}: worker-скрипт не найден: ${workerPath}. Статистика лендинга не обновляется — проверьте, что webpack собрал dist/apps/server/workers/.`,
      );
      return false;
    }

    this.logger.log(`${this.label}: spawning worker ${workerPath}`);
    const child = fork(workerPath, [], {
      env: process.env,
      stdio: 'inherit',
    });
    this.child = child;

    child.on('exit', (code) => {
      if (this.child === child) {
        this.child = null;
      }
      if (code === 0) {
        this.logger.log(`${this.label}: worker completed successfully`);
      } else {
        this.logger.error(`${this.label}: worker exited with code ${code}`);
      }
    });

    child.on('error', (error) => {
      this.logger.error(`${this.label}: worker error: ${error.message}`);
    });

    return true;
  }

  private isRunning(): boolean {
    return !!this.child && this.child.exitCode === null && this.child.signalCode === null;
  }
}
