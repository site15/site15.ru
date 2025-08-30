/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeyvService } from '@nestjs-mod/keyv';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { Octokit } from '@octokit/core';
import { MetricsGithubRepository, MetricsGithubUser, MetricsUser, PrismaClient } from '../generated/prisma-client';
import { METRICS_FEATURE } from '../metrics.constants';
import { MetricsStaticEnvironments } from '../metrics.environments';

// Define interfaces for our extended return types
interface ExtendedMetricsGithubRepository extends MetricsGithubRepository {
  githubData: any | null;
}

interface ExtendedMetricsGithubUser extends MetricsGithubUser {
  githubData: any | null;
}

interface UserStatisticsResult {
  user: {
    githubData: any;
    statistics: any;
  } & MetricsGithubUser;
  repositories: ExtendedMetricsGithubRepository[];
}

interface RepositoryStatisticsResult {
  repository: {
    githubData: any;
    statistics: any;
  } & MetricsGithubRepository;
  users: ExtendedMetricsGithubUser[];
}

@Injectable()
export class MetricsGithubStatisticsSyncService {
  private readonly logger = new Logger(MetricsGithubStatisticsSyncService.name);
  private readonly octokit: Octokit;

  constructor(
    @InjectPrismaClient(METRICS_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly metricsStaticEnvironments: MetricsStaticEnvironments,
    private readonly keyvService: KeyvService,
  ) {
    // Initialize Octokit with a personal access token if available
    const githubToken = this.metricsStaticEnvironments.githubToken;
    this.octokit = new Octokit({
      auth: githubToken || undefined,
    });
  }

  /**
   * Fetches the bot user for data synchronization with caching
   * @returns The bot user with botForDataSync = true
   */
  private async getBotUser(): Promise<MetricsUser> {
    // Try to get bot user from cache first
    const cachedBotUser = await this.keyvService.get('metricsBotUser');
    if (cachedBotUser) {
      return cachedBotUser;
    }

    // If not in cache, fetch from database
    const botUser = await this.prismaClient.metricsUser.findFirst({
      where: { botForDataSync: true },
    });

    if (!botUser) {
      throw new Error('Bot user for data synchronization not found');
    }

    // Cache the bot user for 30 seconds
    await this.keyvService.set('metricsBotUser', botUser, 30_000);

    return botUser;
  }

  /**
   * Fetches information about a GitHub user and their repositories that are linked in our database
   * @param githubUserId The ID of the GitHub user
   * @returns An object containing the GitHub user info and their linked repositories
   */
  async syncUserStatistics(githubUserId: string): Promise<UserStatisticsResult> {
    this.logger.log(`Syncing statistics for GitHub user with ID: ${githubUserId}`);

    // First, get the user from our database
    const dbUser = await this.prismaClient.metricsGithubUser.findUnique({
      where: { id: githubUserId },
    });

    if (!dbUser) {
      throw new Error(`GitHub user with ID ${githubUserId} not found in database`);
    }

    try {
      // Get the bot user for data synchronization
      const botUser = await this.getBotUser();

      // Get repositories linked to this user in our database
      const userRepositories = await this.prismaClient.metricsGithubUserRepository.findMany({
        where: { userId: githubUserId },
        include: {
          MetricsGithubRepository: true,
        },
      });

      // Octokit is always available now

      // Fetch user information from GitHub API
      const { data: githubUser } = await this.octokit.request('GET /users/{username}', {
        username: dbUser.login,
      });

      // Update user information in our database
      const updatedUser = await this.prismaClient.metricsGithubUser.update({
        where: { id: githubUserId },
        data: {
          name: githubUser.name || dbUser.name,
          email: githubUser.email || dbUser.email,
          description: githubUser.bio || dbUser.description,
          avatarUrl: githubUser.avatar_url || dbUser.avatarUrl,
          websiteUrl: githubUser.blog || dbUser.websiteUrl,
          location: githubUser.location || dbUser.location,
          updatedAt: new Date(),
          updatedBy: botUser.id, // Use bot user ID for updatedBy field
        },
      });

      // Create or update user statistics
      const userStats = await this.createOrUpdateUserStatistics(githubUserId, githubUser);

      // Fetch repository information from GitHub API for each linked repository
      const repositoriesWithStats: ExtendedMetricsGithubRepository[] = [];
      for (const userRepo of userRepositories) {
        try {
          const repo = userRepo.MetricsGithubRepository;
          const { data: githubRepo } = await this.octokit.request('GET /repos/{owner}/{repo}', {
            owner: repo.owner,
            repo: repo.name,
          });

          // Update repository information in our database
          const updatedRepo = await this.prismaClient.metricsGithubRepository.update({
            where: { id: repo.id },
            data: {
              description: githubRepo.description || repo.description,
              url: githubRepo.html_url || repo.url,
              private: githubRepo.private,
              fork: githubRepo.fork,
              updatedAt: new Date(),
              updatedBy: botUser.id, // Use bot user ID for updatedBy field
            },
          });

          repositoriesWithStats.push({
            ...updatedRepo,
            githubData: githubRepo,
          } as ExtendedMetricsGithubRepository);
        } catch (error: any) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.logger.error(
            `Error fetching repository data for ${userRepo.repositoryId}: ${error.message}`,
            error.stack,
          );
          // Still include the repository even if we can't fetch GitHub data
          repositoriesWithStats.push({
            ...userRepo.MetricsGithubRepository,
            githubData: null,
          } as ExtendedMetricsGithubRepository);
        }
      }

      return {
        user: {
          ...updatedUser,
          githubData: githubUser,
          statistics: userStats,
        },
        repositories: repositoriesWithStats,
      };
    } catch (error: any) {
      this.logger.error(`Error syncing user statistics for GitHub user ${githubUserId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Fetches information about a GitHub repository and its users that are linked in our database
   * @param repositoryId The ID of the repository
   * @returns An object containing the repository info and its linked users
   */
  async syncRepositoryStatistics(repositoryId: string): Promise<RepositoryStatisticsResult> {
    this.logger.log(`Syncing statistics for repository with ID: ${repositoryId}`);

    // First, get the repository from our database
    const dbRepository = await this.prismaClient.metricsGithubRepository.findUnique({
      where: { id: repositoryId },
    });

    if (!dbRepository) {
      throw new Error(`Repository with ID ${repositoryId} not found in database`);
    }

    try {
      // Get the bot user for data synchronization
      const botUser = await this.getBotUser();

      // Get users linked to this repository in our database
      const repositoryUsers = await this.prismaClient.metricsGithubUserRepository.findMany({
        where: { repositoryId: repositoryId },
        include: {
          MetricsGithubUser: true,
        },
      });

      // Octokit is always available now

      // Fetch repository information from GitHub API
      const { data: githubRepo } = await this.octokit.request('GET /repos/{owner}/{repo}', {
        owner: dbRepository.owner,
        repo: dbRepository.name,
      });

      // Update repository information in our database
      const updatedRepository = await this.prismaClient.metricsGithubRepository.update({
        where: { id: repositoryId },
        data: {
          description: githubRepo.description || dbRepository.description,
          url: githubRepo.html_url || dbRepository.url,
          private: githubRepo.private,
          fork: githubRepo.fork,
          updatedAt: new Date(),
          updatedBy: botUser.id, // Use bot user ID for updatedBy field
        },
      });

      // Fetch user information from GitHub API for each linked user
      const usersWithStats: ExtendedMetricsGithubUser[] = [];
      for (const repoUser of repositoryUsers) {
        try {
          const user = repoUser.MetricsGithubUser;
          const { data: githubUser } = await this.octokit.request('GET /users/{username}', {
            username: user.login,
          });

          // Update user information in our database
          const updatedUser = await this.prismaClient.metricsGithubUser.update({
            where: { id: user.id },
            data: {
              name: githubUser.name || user.name,
              email: githubUser.email || user.email,
              description: githubUser.bio || user.description,
              avatarUrl: githubUser.avatar_url || user.avatarUrl,
              websiteUrl: githubUser.blog || user.websiteUrl,
              location: githubUser.location || user.location,
              updatedAt: new Date(),
              updatedBy: botUser.id, // Use bot user ID for updatedBy field
            },
          });

          usersWithStats.push({
            ...updatedUser,
            githubData: githubUser,
          } as ExtendedMetricsGithubUser);
        } catch (error: any) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.logger.error(`Error fetching user data for ${repoUser.userId}: ${error.message}`, error.stack);
          // Still include the user even if we can't fetch GitHub data
          usersWithStats.push({
            ...repoUser.MetricsGithubUser,
            githubData: null,
          } as ExtendedMetricsGithubUser);
        }
      }

      // Create or update repository statistics
      const repositoryStats = await this.createOrUpdateRepositoryStatistics(repositoryId, githubRepo);

      return {
        repository: {
          ...updatedRepository,
          githubData: githubRepo,
          statistics: repositoryStats,
        },
        users: usersWithStats,
      };
    } catch (error: any) {
      this.logger.error(
        `Error syncing repository statistics for repository ${repositoryId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Fetches the date of the last commit for a GitHub repository
   * @param owner The owner of the repository
   * @param repo The name of the repository
   * @returns The date of the last commit or null if not found
   */
  private async getRepositoryLastCommitDate(owner: string, repo: string): Promise<Date | null> {
    try {
      // Fetch the most recent commit (GitHub returns commits in descending order by default)
      const commits = await this.octokit.request('GET /repos/{owner}/{repo}/commits', {
        owner,
        repo,
        per_page: 1,
        page: 1,
      });

      // If we have commits, return the date of the first (most recent) one
      if (commits.data && commits.data.length > 0) {
        const lastCommit = commits.data[0];
        return lastCommit.commit.author?.date ? new Date(lastCommit.commit.author.date) : null;
      }

      return null;
    } catch (error: any) {
      this.logger.error(`Error fetching last commit date for ${owner}/${repo}: ${error.message}`, error.stack);
      // Return null if we can't fetch the last commit date
      return null;
    }
  }

  /**
   * Fetches the number of commits for a GitHub repository
   * @param owner The owner of the repository
   * @param repo The name of the repository
   * @returns The number of commits
   */
  private async getRepositoryCommitsCount(owner: string, repo: string): Promise<number> {
    try {
      let allCommits: any[] = [];
      let page = 1;
      let hasNextPage = true;

      // Fetch commits paginated (GitHub returns max 100 per page)
      while (hasNextPage) {
        const commits = await this.octokit.request('GET /repos/{owner}/{repo}/commits', {
          owner,
          repo,
          per_page: 100,
          page,
        });

        allCommits = allCommits.concat(commits.data);

        // Check if there are more pages
        const linkHeader = commits.headers.link;
        if (linkHeader && linkHeader.includes('rel="next"')) {
          page++;
        } else {
          hasNextPage = false;
        }
      }

      return allCommits.length;
    } catch (error: any) {
      this.logger.error(`Error fetching commits count for ${owner}/${repo}: ${error.message}`, error.stack);
      // Return 0 if we can't fetch the commits count
      return 0;
    }
  }

  /**
   * Fetches the number of contributors for a GitHub repository
   * @param owner The owner of the repository
   * @param repo The name of the repository
   * @returns The number of contributors
   */
  private async getRepositoryContributorsCount(owner: string, repo: string): Promise<number> {
    try {
      let allContributors: any[] = [];
      let page = 1;
      let hasNextPage = true;

      // Fetch contributors paginated (GitHub returns max 100 per page)
      while (hasNextPage) {
        const contributors = await this.octokit.request('GET /repos/{owner}/{repo}/contributors', {
          owner,
          repo,
          per_page: 100,
          page,
        });

        allContributors = allContributors.concat(contributors.data);

        // Check if there are more pages
        const linkHeader = contributors.headers.link;
        if (linkHeader && linkHeader.includes('rel="next"')) {
          page++;
        } else {
          hasNextPage = false;
        }
      }

      return allContributors.length;
    } catch (error: any) {
      this.logger.error(`Error fetching contributors count for ${owner}/${repo}: ${error.message}`, error.stack);
      // Return 0 if we can't fetch the contributors count
      return 0;
    }
  }

  /**
   * Creates or updates repository statistics
   * @param repositoryId The ID of the repository
   * @param githubRepo The GitHub repository data (optional)
   * @returns The created or updated repository statistics
   */
  private async createOrUpdateRepositoryStatistics(repositoryId: string, githubRepo: any) {
    try {
      // First, get the repository to access tenantId
      const repository = await this.prismaClient.metricsGithubRepository.findUnique({
        where: { id: repositoryId },
      });

      if (!repository) {
        throw new Error(`Repository with ID ${repositoryId} not found`);
      }

      // Get the bot user for data synchronization
      const botUser = await this.getBotUser();

      // Get contributors count for the repository
      let contributorsCount = 0;
      let commitsCount = 0;
      let lastCommitDate: Date | null = null;
      if (githubRepo) {
        contributorsCount = await this.getRepositoryContributorsCount(repository.owner, repository.name);
        commitsCount = await this.getRepositoryCommitsCount(repository.owner, repository.name);
        lastCommitDate = await this.getRepositoryLastCommitDate(repository.owner, repository.name);
      }

      this.logger.debug({ githubRepo });
      // Create new statistics
      return await this.prismaClient.metricsGithubRepositoryStatistics.create({
        data: {
          repositoryId: repositoryId,
          tenantId: repository.tenantId,
          periodType: 'CURRENT',
          starsCount: githubRepo?.stargazers_count || 0,
          forksCount: githubRepo?.forks_count || 0,
          contributorsCount: contributorsCount,
          commitsCount: commitsCount,
          lastCommitDate: lastCommitDate,
          recordedAt: new Date(),
          createdBy: botUser.id,
          updatedBy: botUser.id,
        },
      });
    } catch (error: any) {
      this.logger.error(`Error creating/updating repository statistics: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Creates or updates user statistics
   * @param userId The ID of the user
   * @param githubUser The GitHub user data (optional)
   * @returns The created or updated user statistics
   */
  private async createOrUpdateUserStatistics(userId: string, githubUser: any) {
    try {
      // First, get the user to access tenantId
      const user = await this.prismaClient.metricsGithubUser.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Get the bot user for data synchronization
      const botUser = await this.getBotUser();

      // Create new statistics
      return await this.prismaClient.metricsGithubUserStatistics.create({
        data: {
          userId: userId,
          tenantId: user.tenantId,
          periodType: 'CURRENT',
          followersCount: githubUser?.followers || 0,
          followingCount: githubUser?.following || 0,
          recordedAt: new Date(),
          createdBy: botUser.id,
          updatedBy: botUser.id,
        },
      });
    } catch (error: any) {
      this.logger.error(`Error creating/updating user statistics: ${error.message}`, error.stack);
      return null;
    }
  }
}
