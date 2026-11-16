/**
 * Ограниченное параллельное выполнение асинхронных задач.
 *
 * Площадки (YouTube, Rutube, VK, GitHub, NPM) опрашиваются для каждого видео/репозитория
 * отдельно, и полный набор обращений — десятки запросов. Выполнять их строго
 * последовательно нельзя: суммарная длительность складывается из всех таймаутов,
 * и фоновый прогон статистики не доживает до хвоста списка. Гнать всё одним
 * Promise.all тоже плохо — площадки отвечают 429 на всплеск обращений.
 * Отсюда пакетный прогон: одновременно не более `limit` задач.
 */
export async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  const workerCount = Math.max(1, Math.min(limit, items.length));
  const workers = new Array(workerCount).fill(null).map(async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  });

  await Promise.all(workers);
  return results;
}
