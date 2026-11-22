import { Logger } from '@nestjs/common';

const logger = new Logger('ReadTimeout');

/**
 * Ограничивает ожидание промиса фиксированным временем, по истечении которого
 * отдаёт fallbackValue вместо ответа.
 *
 * Нужен потому, что чтение из PostgreSQL под эндпоинтами лендинга может
 * зависнуть навсегда: у node-postgres нет таймаута на установку соединения по
 * умолчанию, а /api/landing/* вызывает браузер при каждой загрузке страницы.
 * Такой зависший запрос держит HTTP-соединение и оставляет счётчики в
 * состоянии «Загрузка...» — поэтому ждём строго ограниченное время и
 * деградируем в запасной ответ.
 *
 * Проигравший промис отменить нельзя, поэтому он только доживает свой век в
 * фоне; это осознанная цена за то, чтобы фронтенд получил ответ.
 */
export async function withReadTimeout<T>(
  label: string,
  promise: Promise<T>,
  timeoutMs: number,
  fallbackValue: T,
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => {
          logger.warn(`${label}: ожидание больше ${timeoutMs} мс — отдаём запасной ответ`);
          resolve(fallbackValue);
        }, timeoutMs);
      }),
    ]);
  } catch (error) {
    logger.warn(`${label}: чтение не удалось (${String(error)}) — отдаём запасной ответ`);
    return fallbackValue;
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}
