import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNotEmpty, IsDefined } from 'class-validator';

export interface AllStats {
  githubStats: GithubStats;
  kaufmanbotStats: RepoStats;
  nestjsModStats: RepoStats;
  ngxDynamicFormBuilderStats: RepoStats;
  nestPermissionsSeedStats: RepoStats;
  typeGraphqlPrismaNestjsStats: RepoStats;
  classValidatorMultiLangStats: RepoStats;
  myDashboardStats: RepoStats;
  ragSystemStats: RepoStats;
  opworkStats: RepoStats;
  devToStats: DevToStats;
  telegramDataStats: TelegramChannelStats[];
  habrStats: HabrStats;
  npmNestjsModStats: NpmStats;
}

/* ---------------- GitHub ---------------- */

export interface GithubStats {
  rucken: {
    stars: number;
    commits: number;
  };
  user: {
    followers: number;
    repos: number;
    totalStars: number;
  };
  org: {
    repos: number;
    totalStars: number;
  };
  commitDuration: string; // "2 года 11 месяцев 26 дней"
}

/* ---------------- Репозитории ---------------- */

export interface RepoStats {
  stars: number;
  commits: number;
  duration: string; // человекочитаемая длительность
}

/* ---------------- Dev.to ---------------- */

export interface DevToStats {
  articles: number;
  followers: number;
  views: number;
  reactions: number;
}

/* ---------------- Telegram ---------------- */

export interface TelegramChannelStats {
  id: string;
  data: {
    members: string; // "3 013" (не number из-за пробелов)
    online: string; // "1 403" | "N/A"
  };
}

/* ---------------- Habr ---------------- */

export interface HabrStats {
  articles: string;
  followers: string;
  karma: string;
}

/* ---------------- NPM ---------------- */

export interface NpmStats {
  downloads: number;
}

////////////////////////// DTO /////////////////

export class GithubRepoStatsDto {
  @ApiProperty()
  stars!: number;

  @ApiProperty()
  commits!: number;
}

export class GithubUserStatsDto {
  @ApiProperty()
  followers!: number;

  @ApiProperty()
  repos!: number;

  @ApiProperty()
  totalStars!: number;
}

export class GithubOrgStatsDto {
  @ApiProperty()
  repos!: number;

  @ApiProperty()
  totalStars!: number;
}

export class GithubStatsDto {
  @ApiProperty({ type: () => GithubRepoStatsDto })
  rucken!: GithubRepoStatsDto;

  @ApiProperty({ type: () => GithubUserStatsDto })
  user!: GithubUserStatsDto;

  @ApiProperty({ type: () => GithubOrgStatsDto })
  org!: GithubOrgStatsDto;

  @ApiProperty({
    example: '2 года 11 месяцев 26 дней',
  })
  commitDuration!: string;
}

export class RepoStatsDto {
  @ApiProperty()
  stars!: number;

  @ApiProperty()
  commits!: number;

  @ApiProperty({
    example: '1 год 7 месяцев 15 дней',
  })
  duration!: string;
}

export class DevToStatsDto {
  @ApiProperty()
  articles!: number;

  @ApiProperty()
  followers!: number;

  @ApiProperty()
  views!: number;

  @ApiProperty()
  reactions!: number;
}

export class TelegramChannelDataDto {
  @ApiProperty({
    example: '3 013',
  })
  members!: string;

  @ApiProperty({
    example: '1 403',
  })
  online!: string;
}

export class TelegramChannelStatsDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: () => TelegramChannelDataDto })
  data!: TelegramChannelDataDto;
}

export class HabrStatsDto {
  @ApiProperty()
  articles!: string;

  @ApiProperty()
  followers!: string;

  @ApiProperty()
  karma!: string;
}

export class NpmStatsDto {
  @ApiProperty()
  downloads!: number;
}

export class LandingAllStatsDto {
  @ApiProperty({ type: () => GithubStatsDto })
  githubStats!: GithubStatsDto;

  @ApiProperty({ type: () => RepoStatsDto })
  kaufmanbotStats!: RepoStatsDto;

  @ApiProperty({ type: () => RepoStatsDto })
  nestjsModStats!: RepoStatsDto;

  @ApiProperty({ type: () => RepoStatsDto })
  ngxDynamicFormBuilderStats!: RepoStatsDto;

  @ApiProperty({ type: () => RepoStatsDto })
  nestPermissionsSeedStats!: RepoStatsDto;

  @ApiProperty({ type: () => RepoStatsDto })
  typeGraphqlPrismaNestjsStats!: RepoStatsDto;

  @ApiProperty({ type: () => RepoStatsDto })
  classValidatorMultiLangStats!: RepoStatsDto;

  @ApiProperty({ type: () => RepoStatsDto })
  myDashboardStats!: RepoStatsDto;

  @ApiProperty({ type: () => RepoStatsDto })
  ragSystemStats!: RepoStatsDto;

  @ApiProperty({ type: () => RepoStatsDto })
  opworkStats!: RepoStatsDto;

  @ApiProperty({ type: () => DevToStatsDto })
  devToStats!: DevToStatsDto;

  @ApiProperty({
    type: () => TelegramChannelStatsDto,
    isArray: true,
  })
  telegramDataStats!: TelegramChannelStatsDto[];

  @ApiProperty({ type: () => HabrStatsDto })
  habrStats!: HabrStatsDto;

  @ApiProperty({ type: () => NpmStatsDto })
  npmNestjsModStats!: NpmStatsDto;
}

export class LandingAllStatsResponse {
  @ApiProperty({
    type: () => LandingAllStatsDto,
  })
  allStats!: LandingAllStatsDto;
}

export class LandingSendMessageDto {
  @ApiPropertyOptional({
    type: 'string',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    type: 'string',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  message!: string;
}

/* ---------------- Chat ---------------- */

export class DialogMessagePrompt {
  @ApiProperty({
    type: 'string',
  })
  @IsDefined()
  prompt!: string;

  @ApiProperty({
    type: 'string',
  })
  @IsDefined()
  result!: string;

  @ApiProperty({ type: 'number' })
  @IsDefined()
  @Type(() => Number)
  duration!: number;

  @ApiProperty({ type: 'string' })
  @IsString()
  info!: string;
}

export class ChatMessageDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sessionId!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  sender!: 'user' | 'bot';

  @ApiProperty()
  timestamp!: Date | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    type: 'boolean',
  })
  isProcessing!: boolean;

  @ApiProperty({
    type: 'boolean',
  })
  isError!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  info?: string;

  @ApiPropertyOptional({ type: () => [DialogMessagePrompt] })
  @IsDefined()
  prompts?: DialogMessagePrompt[];
}

export class ChatSendMessageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}

export class ChatListMessagesResponse {
  @ApiProperty({
    type: () => ChatMessageDto,
    isArray: true,
  })
  messages!: ChatMessageDto[];
}

/* ---------------- Video stats (landing) ---------------- */

export class VideoChannelStatsDto {
  @ApiPropertyOptional({
    type: 'number',
    nullable: true,
    description: 'Количество просмотров (null — недоступно/не парсится)',
  })
  views?: number | null;

  @ApiPropertyOptional({
    type: 'number',
    nullable: true,
    description: 'Количество лайков (null — площадка не отдаёт лайки публично)',
  })
  likes?: number | null;
}

/** Конфигурация одного короткого видео (shorts/clips). */
export class LandingVideoShortDto {
  @ApiPropertyOptional({ description: 'YouTube Shorts video ID' })
  @IsOptional()
  @IsString()
  youtubeId?: string | null;

  @ApiPropertyOptional({ description: 'Rutube Shorts video hash' })
  @IsOptional()
  @IsString()
  rutubeId?: string | null;

  @ApiPropertyOptional({ description: 'VK Video clip id (oid_id формат)' })
  @IsOptional()
  @IsString()
  vkId?: string | null;

  @ApiProperty({ description: 'Заголовок short' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Прямая ссылка на YouTube Shorts' })
  @IsOptional()
  @IsString()
  ytHref?: string | null;

  @ApiPropertyOptional({ description: 'Прямая ссылка на Rutube Shorts' })
  @IsOptional()
  @IsString()
  rutubeHref?: string | null;

  @ApiPropertyOptional({ description: 'Прямая ссылка на VK Video clip' })
  @IsOptional()
  @IsString()
  vkHref?: string | null;

  @ApiPropertyOptional({
    description: 'YouTube ID родительского видео (к которому относится этот short)',
  })
  @IsOptional()
  @IsString()
  parentYoutubeId?: string | null;
}

export class LandingVideoStatsResponse {
  @ApiPropertyOptional({ type: () => VideoChannelStatsDto, nullable: true })
  youtube?: VideoChannelStatsDto | null;

  @ApiPropertyOptional({ type: () => VideoChannelStatsDto, nullable: true })
  rutube?: VideoChannelStatsDto | null;

  @ApiPropertyOptional({ type: () => VideoChannelStatsDto, nullable: true })
  vk?: VideoChannelStatsDto | null;
}

/** Конфигурация одного видео лендинга (ID-шники площадок + ссылки + мета). */
export class LandingVideoDto {
  @ApiPropertyOptional({ description: 'YouTube video ID' })
  @IsOptional()
  @IsString()
  youtubeId?: string | null;

  @ApiPropertyOptional({ description: 'Rutube video hash' })
  @IsOptional()
  @IsString()
  rutubeId?: string | null;

  @ApiPropertyOptional({ description: 'VK Video id (oid_id формат)' })
  @IsOptional()
  @IsString()
  vkId?: string | null;

  @ApiProperty({ description: 'Метка в сайдбаре (напр. «Часть 1 · Видео»)' })
  @IsString()
  label!: string;

  @ApiProperty({ description: 'Короткое название части' })
  @IsString()
  shortTitle!: string;

  @ApiProperty({ description: 'Стек/теги части' })
  @IsString()
  techTags!: string;

  @ApiProperty({ description: 'Заголовок видео' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Описание видео' })
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Ссылка на детальную страницу' })
  @IsString()
  detailUrl!: string;

  @ApiProperty({ description: 'Ссылка на репозиторий' })
  @IsString()
  repoUrl!: string;

  @ApiProperty({ description: 'Прямая ссылка на YouTube' })
  @IsString()
  ytHref!: string;

  @ApiProperty({ description: 'Прямая ссылка на Rutube' })
  @IsString()
  rutubeHref!: string;

  @ApiProperty({ description: 'Прямая ссылка на VK Видео' })
  @IsString()
  vkHref!: string;

  @ApiPropertyOptional({
    type: () => LandingVideoShortDto,
    isArray: true,
    description: 'Список коротких видео (shorts/clips), связанных с этим видео',
  })
  @IsOptional()
  shorts?: LandingVideoShortDto[] | null;
}

/** Видео лендинга вместе со статистикой по каждой площадке. */
export class LandingVideoWithStatsDto {
  @ApiProperty({ type: () => LandingVideoDto })
  video!: LandingVideoDto;

  @ApiPropertyOptional({ type: () => VideoChannelStatsDto, nullable: true })
  youtubeStats?: VideoChannelStatsDto | null;

  @ApiPropertyOptional({ type: () => VideoChannelStatsDto, nullable: true })
  rutubeStats?: VideoChannelStatsDto | null;

  @ApiPropertyOptional({ type: () => VideoChannelStatsDto, nullable: true })
  vkStats?: VideoChannelStatsDto | null;

  @ApiPropertyOptional({
    type: () => VideoChannelStatsDto,
    isArray: true,
    nullable: true,
    description: 'Статистика для каждого short (в том же порядке, что и video.shorts)',
  })
  shortsStats?: Array<{
    youtubeStats?: VideoChannelStatsDto | null;
    rutubeStats?: VideoChannelStatsDto | null;
    vkStats?: VideoChannelStatsDto | null;
  }> | null;
}

export class LandingVideosResponse {
  @ApiProperty({ type: () => LandingVideoWithStatsDto, isArray: true })
  videos!: LandingVideoWithStatsDto[];
}

/* ---------------- Metric history (landing trend badges) ---------------- */

/** Одна точка истории метрики: значение (строкой — как лежит в БД) и время записи. */
export class MetricPointDto {
  @ApiProperty({
    type: 'string',
    nullable: true,
    description: 'Значение метрики из metricsDynamicHistory',
  })
  value!: string | null;

  @ApiProperty({
    type: 'string',
    description: 'ISO-время появления значения (createdAt записи истории)',
  })
  createdAt!: string;
}

/** История одной метрики: ключ + последние N точек, самая свежая — первой. */
export class MetricHistoryItemDto {
  @ApiProperty({
    example: 'githubStats|rucken|stars',
    description: 'Ключ метрики: level1|level2|level3',
  })
  key!: string;

  @ApiProperty({ type: () => MetricPointDto, isArray: true })
  points!: MetricPointDto[];
}

export class LandingMetricHistoryResponse {
  @ApiProperty({ type: () => MetricHistoryItemDto, isArray: true })
  items!: MetricHistoryItemDto[];
}
