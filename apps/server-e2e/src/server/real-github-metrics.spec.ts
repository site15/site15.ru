import {
  CreateFullMetricsGithubTeamRepositoryDto,
  CreateFullMetricsGithubTeamUserDto,
  CreateFullMetricsGithubUserRepositoryDto,
  CreateMetricsGithubRepositoryDto,
  CreateMetricsGithubTeamDto,
  CreateMetricsGithubUserDto,
  MetricsErrorEnum,
  MetricsGithubRepositoryDto,
  MetricsGithubTeamDto,
  MetricsGithubUserDto,
} from '@site15/rest-sdk';
import { Site15RestClientHelper } from '@site15/testing';

describe('Create all need for github metrics and run sync methods (e2e)', () => {
  let user: Site15RestClientHelper<'strict'>;
  let metricsGithubRepositoryDto: MetricsGithubRepositoryDto;
  let metricsGithubUserDto: MetricsGithubUserDto;
  let metricsGithubTeamDto: MetricsGithubTeamDto;

  jest.setTimeout(5 * 60 * 1000);

  beforeAll(async () => {
    user = await new Site15RestClientHelper({
      headers: {
        'x-skip-throttle': process.env.SITE_15_SSO_ADMIN_SECRET,
        'x-skip-email-verification': process.env.SITE_15_SSO_ADMIN_SECRET,
      },
    }).createAndLoginAsUser();
  });

  it('should create a GitHub repository', async () => {
    const repoData: CreateMetricsGithubRepositoryDto = {
      name: 'nestjs-mod',
      owner: 'nestjs-mod',
      private: false,
      fork: false,
      description: 'NestJS Mod repository for integration tests',
      url: 'https://github.com/nestjs-mod/nestjs-mod',
    };

    const response = await user.getMetricsApi().metricsGithubRepositoriesControllerCreateOne(repoData);

    expect(response.data).toHaveProperty('id');
    expect(response.data.name).toEqual('nestjs-mod');
    expect(response.data.owner).toEqual('nestjs-mod');
    expect(response.data.private).toEqual(false);
    expect(response.data.fork).toEqual(false);

    metricsGithubRepositoryDto = response.data;
  });

  it('should create GitHub users', async () => {
    const userData: CreateMetricsGithubUserDto = {
      login: 'EndyKaufman',
      name: 'Endy Kaufman',
      email: 'endy@example.com',
      description: 'Real GitHub user EndyKaufman for integration tests',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1670298',
      websiteUrl: 'https://github.com/EndyKaufman',
      location: 'Russia',
      telegramUrl: 'https://t.me/EndyKaufman',
      twitterUrl: 'https://twitter.com/EndyKaufman',
    };

    const response = await user.getMetricsApi().metricsGithubUsersControllerCreateOne(userData);

    expect(response.data).toHaveProperty('id');
    expect(response.data.login).toEqual('EndyKaufman');
    expect(response.data.name).toEqual('Endy Kaufman');
    expect(response.data.email).toEqual('endy@example.com');

    metricsGithubUserDto = response.data;
  });

  it('should create a GitHub team', async () => {
    const teamData: CreateMetricsGithubTeamDto = {
      name: 'test-team-' + Date.now(),
      description: 'Test team for integration tests',
    };

    const response = await user.getMetricsApi().metricsGithubTeamsControllerCreateOne(teamData);

    expect(response.data).toHaveProperty('id');
    expect(response.data.name).toContain('test-team');
    expect(response.data.description).toEqual('Test team for integration tests');

    metricsGithubTeamDto = response.data;
  });

  it('should bind a user to a team', async () => {
    // Then bind user to team
    const teamUserData: CreateFullMetricsGithubTeamUserDto = {
      teamId: metricsGithubTeamDto.id,
      userId: metricsGithubUserDto.id,
      role: 'member',
    };

    const response = await user.getMetricsApi().metricsGithubTeamUsersControllerCreateOne(teamUserData);

    expect(response.data).toHaveProperty('id');
    // Note: The response DTO doesn't include teamId and userId directly
    expect(response.data.role).toEqual('member');
  });

  it('should bind a repository to a team', async () => {
    // Then bind repository to team
    const teamRepoData: CreateFullMetricsGithubTeamRepositoryDto = {
      teamId: metricsGithubTeamDto.id,
      repositoryId: metricsGithubRepositoryDto.id,
    };

    const response = await user.getMetricsApi().metricsGithubTeamRepositoriesControllerCreateOne(teamRepoData);

    expect(response.data).toHaveProperty('id');
  });

  it('should bind a repository to a user', async () => {
    // Then bind repository to user
    const userRepoData: CreateFullMetricsGithubUserRepositoryDto = {
      userId: metricsGithubUserDto.id,
      repositoryId: metricsGithubRepositoryDto.id,
      role: 'owner',
    };

    const response = await user.getMetricsApi().metricsGithubUserRepositoriesControllerCreateOne(userRepoData);

    expect(response.data).toHaveProperty('id');
  });

  it('should manually sync repository statistics', async () => {
    // Trigger manual synchronization
    const syncResponse = await user
      .getMetricsApi()
      .metricsGithubRepositoryStatisticsControllerSyncRepositoryStatistics(metricsGithubRepositoryDto.id);

    expect(syncResponse.data).toHaveProperty('message');
    expect(syncResponse.data.message).toContain('Repository statistics synchronization started');
  });

  xit('should manually sync user statistics', async () => {
    // Trigger manual synchronization
    const syncResponse = await user
      .getMetricsApi()
      .metricsGithubUserStatisticsControllerSyncUserStatistics(metricsGithubUserDto.id);

    expect(syncResponse.data).toHaveProperty('message');
    expect(syncResponse.data.message).toContain('User statistics synchronization started');
  });

  it('should handle sync requests for non-existent entities gracefully', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    // Try to sync non-existent user
    try {
      await user.getMetricsApi().metricsGithubUserStatisticsControllerSyncUserStatistics(nonExistentId);
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Expect a 404 error
      expect(error.response.status).toBe(400);
      expect(error.response.data.code).toBe(MetricsErrorEnum.Metrics001);
    }

    // Try to sync non-existent repository
    try {
      await user.getMetricsApi().metricsGithubRepositoryStatisticsControllerSyncRepositoryStatistics(nonExistentId);
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Expect a 404 error
      expect(error.response.status).toBe(400);
      expect(error.response.data.code).toBe(MetricsErrorEnum.Metrics001);
    }
  });
});
