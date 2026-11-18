import { Injectable } from '@nestjs/common';

import { LandingMusicAlbumDto, LandingMusicAlbumsResponse } from './type';

/**
 * Конфигурация музыкальных релизов лендинга.
 *
 * Архитектурно то же, что и `VIDEOS` в VideoStatsService: источник истины —
 * сервер, фронтенд получает список одним запросом и держит свой массив только
 * как fallback на случай недоступного бэкенда.
 *
 * Внешних запросов здесь нет и не планируется: счётчики прослушиваний площадки
 * публично не отдают (в отличие от видео, где RSS-фид YouTube даёт точные
 * просмотры), поэтому секция музыка — чистая раздача конфигурации.
 *
 * Площадки отобраны по признаку «реально встраивается iframe'ом»:
 *  - Яндекс Музыка — `music.yandex.ru/iframe/#/album/<id>` (фреймится, трек-лист подтягивается);
 *  - Spotify — `open.spotify.com/embed/album/<id>`;
 *  - SoundCloud — `w.soundcloud.com/player/?url=…/sets/<slug>` (там же открыто скачивание).
 * VK Музыка в список плееров не вошла: `vk.com/audio?...&embed=1` отдаёт
 * `X-Frame-Options: deny`, так что остаётся ссылкой (в `links`).
 */
@Injectable()
export class MusicAlbumsService {
  private static readonly ALBUMS: LandingMusicAlbumDto[] = [
    {
      slug: 'autumn-exe',
      label: 'Альбом 1 · Музыка',
      shortTitle: 'Autumn Exe',
      techTags: 'Electronic · Downtempo · instrumental',
      title: 'Autumn Exe',
      artist: 'EndyKaufman',
      description:
        'Тёмный лоу-фай без пения, сгенерированный через AI: 14 инструментальных треков, 49 минут. Это музыка для долгих часов за клавиатурой — под неё пишут код, учатся и дочитывают вечер. Дуга темпа от 53 до 162 BPM: от медленных треков к подвижным.',
      facts: '14 треков · 49 минут · 53→162 BPM',
      releaseDate: '2026-11-01',
      coverUrl: './music/autumn-exe/cover.jpg',
      detailUrl: './music/autumn-exe.html',
      embeds: [
        {
          provider: 'yandex',
          label: 'Яндекс Музыка',
          embedUrl: 'https://music.yandex.ru/iframe/#/album/44782986',
          href: 'https://music.yandex.ru/album/44782986',
          height: 560,
        },
        {
          provider: 'spotify',
          label: 'Spotify',
          embedUrl: 'https://open.spotify.com/embed/album/3lel7yF3XSAZ52yPaXLP9O',
          href: 'https://open.spotify.com/album/3lel7yF3XSAZ52yPaXLP9O',
          height: 560,
        },
        {
          provider: 'soundcloud',
          label: 'SoundCloud',
          embedUrl:
            'https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fendykaufman%2Fsets%2Fautumn-exe' +
            '&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false' +
            '&show_user=true&show_reposts=false&show_teaser=false',
          href: 'https://soundcloud.com/endykaufman/sets/autumn-exe',
          height: 540,
        },
      ],
      links: [
        { label: 'VK Музыка', href: 'https://vk.ru/music/album/-2000922681_29922681' },
        { label: 'Apple Music', href: 'https://music.apple.com/us/album/autumn-exe/6829883972' },
        { label: 'Deezer', href: 'https://www.deezer.com/album/1136724141' },
        { label: 'Звук', href: 'https://zvuk.com/release/53754548' },
        { label: 'MTS Music', href: 'https://music.mts.ru/artist/26871345/albums/44782986' },
        { label: 'Amazon Music', href: 'https://music.amazon.co.uk/albums/B0HQ54HF1R' },
        { label: 'Qobuz', href: 'https://www.qobuz.com/ca-en/album/autumn-exe-endykaufman/kdqwirz3pan0w' },
        { label: 'Все витрины (band.link)', href: 'https://band.link/AutumnExe' },
      ],
      // Длительности — ffprobe по WAV релиза, BPM — замер каталога библиотеки.
      tracks: [
        { n: 1, title: 'Golden Autumn Reprise', duration: '3:49', bpm: 53 },
        { n: 2, title: 'The Warmth', duration: '3:30', bpm: 55 },
        { n: 3, title: 'Daylight Warmth', duration: '3:34', bpm: 76 },
        { n: 4, title: 'Golden Autumn Woods', duration: '3:25', bpm: 78 },
        { n: 5, title: 'Stronger Current', duration: '3:30', bpm: 78 },
        { n: 6, title: 'Fading Warmth', duration: '3:19', bpm: 78 },
        { n: 7, title: 'Quiet Warmth', duration: '3:19', bpm: 85 },
        { n: 8, title: 'Note by Note', duration: '3:35', bpm: 85 },
        { n: 9, title: 'Deep Current', duration: '3:43', bpm: 85 },
        { n: 10, title: 'Autumn Nights', duration: '3:40', bpm: 152 },
        { n: 11, title: 'Volga Mist Reprise', duration: '3:18', bpm: 157 },
        { n: 12, title: 'Volga Mist', duration: '3:09', bpm: 157 },
        { n: 13, title: 'Evening Warmth', duration: '3:19', bpm: 157 },
        { n: 14, title: 'Restless Heart', duration: '4:05', bpm: 162 },
      ],
    },
  ];

  /** Просто конфигурация — без внешних ходов и кэшей. */
  getAllAlbums(): LandingMusicAlbumsResponse {
    return { albums: MusicAlbumsService.ALBUMS };
  }
}
