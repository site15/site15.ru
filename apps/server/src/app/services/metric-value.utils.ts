/**
 * Проверки «правдоподобности» значений метрик лендинга.
 *
 * Площадки (GitHub, NPM, Telegram, видео-хостинги) периодически отдают 403 /
 * 429 / 5xx или пустой ответ. Если в этот момент парсёр подставит 0, в
 * metricsDynamic затирается реальное значение, а в metricsDynamicHistory ложится
 * падение с последующим «восстановлением» — тренд-бейджи начинают показывать
 * чушь. Оба места записи (MetricsDynamicService.syncAllStats и
 * VideoStatsService.save) используют этот модуль, чтобы не портить данные.
 */

/**
 * Нули и пустые значения в истории — следы сбоев опроса (площадка отдала пустой
 * ответ, парсер не нашёл число), а не реальные данные: звёзды/подписчики/просмотры
 * не «обнуляются» с последующим восстановлением. Такие точки не участвуют ни в
 * сравнении тренда, ни в модалке последних значений.
 *
 * Нечисловые строки (длительности, «N/A») не считаем нулём — их судьба за фронтом.
 */
export function isBlankOrZeroMetricValue(value: string | null): boolean {
  if (value === null || value.trim() === '') {
    return true;
  }
  const text = value.replace(/[\s\u00a0]/g, '').replace(/[\u2212\u2013\u2014]/g, '-');
  if (!/^-?\d+(\.\d+)?$/.test(text)) {
    return false;
  }
  return Number(text) === 0;
}

/**
 * Счётчики лендинга (звёзды, репозитории, подписчики, загрузки) не обнуляются
 * сами по себе: 0 или пустота приходит, когда площадка отдала 403/5xx, а парсёр
 * подставил fallback. Такую запись в базу не пишем — иначе лендинг показывает 0,
 * а в историю ложится ложное падение с последующим «ростом». Настоящий первый
 * ноль счётчика проходит: до записи в базе тоже пусто или ноль.
 */
export function isWritableMetricValue(previousValue: string | null, nextValue: string | null): boolean {
  if (!isBlankOrZeroMetricValue(nextValue)) {
    return true;
  }
  if (nextValue === null || nextValue.trim() === '') {
    return false;
  }
  return previousValue === null || previousValue.trim() === '' || isBlankOrZeroMetricValue(previousValue);
}
