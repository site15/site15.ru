import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { Octokit } from '@octokit/core';
import { MetricsGithubRepository, MetricsGithubUser, PrismaClient } from '../generated/prisma-client';
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
  ) {
    // Initialize Octokit with a personal access token if available
    const githubToken = this.metricsStaticEnvironments.githubToken;
    this.octokit = new Octokit({
      auth: githubToken || undefined,
    });
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
        },
      });

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
            },
          });

          repositoriesWithStats.push({
            ...updatedRepo,
            githubData: githubRepo,
          });
        } catch (error) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.logger.error(
            `Error fetching repository data for ${userRepo.repositoryId}: ${(error as any).message}`,
            (error as any).stack,
          );
          // Still include the repository even if we can't fetch GitHub data
          repositoriesWithStats.push({
            ...userRepo.MetricsGithubRepository,
            githubData: null,
          });
        }
      }

      return {
        user: {
          ...updatedUser,
          githubData: githubUser,
        },
        repositories: repositoriesWithStats,
      };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.logger.error(
        `Error syncing user statistics for GitHub user ${githubUserId}: ${(error as any).message}`,
        (error as any).stack,
      );
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
            },
          });

          usersWithStats.push({
            ...updatedUser,
            githubData: githubUser,
          });
        } catch (error) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.logger.error(
            `Error fetching user data for ${repoUser.userId}: ${(error as any).message}`,
            (error as any).stack,
          );
          // Still include the user even if we can't fetch GitHub data
          usersWithStats.push({
            ...repoUser.MetricsGithubUser,
            githubData: null,
          });
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
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.logger.error(
        `Error syncing repository statistics for repository ${repositoryId}: ${(error as any).message}`,
        (error as any).stack,
      );
      throw error;
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

      // Try to find existing statistics
      const existingStats = await this.prismaClient.metricsGithubRepositoryStatistics.findFirst({
        where: { repositoryId: repositoryId },
      });

      // For now, we'll use a placeholder user ID. In a real implementation,
      // this should be the actual user performing the sync operation.
      const placeholderUserId = '00000000-0000-0000-0000-000000000000';

      if (existingStats) {
        // Update existing statistics
        return await this.prismaClient.metricsGithubRepositoryStatistics.update({
          where: { id: existingStats.id },
          data: {
            repositoryId: repositoryId,
            tenantId: repository.tenantId,
            periodType: 'CURRENT',
            starsCount: githubRepo?.stargazers_count || 0,
            forksCount: githubRepo?.forks_count || 0,
            contributorsCount: 0,
            commitsCount: 0,
            lastCommitDate: null,
            recordedAt: new Date(),
            updatedAt: new Date(),
            updatedBy: placeholderUserId,
          },
        });
      } else {
        // Create new statistics
        return await this.prismaClient.metricsGithubRepositoryStatistics.create({
          data: {
            repositoryId: repositoryId,
            tenantId: repository.tenantId,
            periodType: 'CURRENT',
            starsCount: githubRepo?.stargazers_count || 0,
            forksCount: githubRepo?.forks_count || 0,
            contributorsCount: 0,
            commitsCount: 0,
            lastCommitDate: null,
            recordedAt: new Date(),
            createdBy: placeholderUserId,
            updatedBy: placeholderUserId,
          },
        });
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.logger.error(
        `Error creating/updating repository statistics: ${(error as any).message}`,
        (error as any).stack,
      );
      return null;
    }
  }
}
