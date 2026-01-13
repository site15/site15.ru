import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export interface AllStats {
  githubStats: GithubStats;
  kaufmanbotStats: RepoStats;
  nestjsModStats: RepoStats;
  ngxDynamicFormBuilderStats: RepoStats;
  nestPermissionsSeedStats: RepoStats;
  typeGraphqlPrismaNestjsStats: RepoStats;
  classValidatorMultiLangStats: RepoStats;
  myDashboardStats: RepoStats;
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

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  email!: string;

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  message!: string;
}

/* ---------------- Chat ---------------- */

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
  timestamp!: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}

export class ChatSendMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sessionId!: string;

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
