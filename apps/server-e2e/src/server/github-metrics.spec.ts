import { Site15RestClientHelper } from '@site15/testing';
import {
  CreateMetricsGithubRepositoryDto,
  CreateMetricsGithubUserDto,
  CreateMetricsGithubTeamDto,
  CreateFullMetricsGithubTeamUserDto,
  CreateFullMetricsGithubTeamRepositoryDto,
  CreateFullMetricsGithubUserRepositoryDto,
} from '@site15/rest-sdk';

describe('Create all need for github metrics (e2e)', () => {
  let user: Site15RestClientHelper<'strict'>;

  jest.setTimeout(5 * 60 * 1000);

  beforeAll(async () => {
    user = await new Site15RestClientHelper({
      headers: {
        'x-skip-throttle': process.env.SITE_15_SSO_ADMIN_SECRET,
        'x-skip-email-verification': process.env.SITE_15_SSO_ADMIN_SECRET,
      },
    }).createAndLoginAsUser();
  });

  // 1) Создать репозиторий
  it('should create a GitHub repository', async () => {
    const repoData: CreateMetricsGithubRepositoryDto = {
      name: 'test-repo-' + Date.now(),
      owner: 'test-owner',
      private: false,
      fork: false,
      description: 'Test repository for integration tests',
      url: 'https://github.com/test-owner/test-repo',
    };

    const response = await user.getMetricsApi().metricsGithubRepositoryControllerCreateOne(repoData);

    expect(response.data).toHaveProperty('id');
    expect(response.data.name).toContain('test-repo');
    expect(response.data.owner).toEqual('test-owner');
    expect(response.data.private).toEqual(false);
    expect(response.data.fork).toEqual(false);
  });

  // 2) Создать юзеров гитхаб
  it('should create GitHub users', async () => {
    const userData: CreateMetricsGithubUserDto = {
      login: 'testuser-' + Date.now(),
      name: 'Test User',
      email: 'test@example.com',
      description: 'Test GitHub user for integration tests',
      avatarUrl: 'https://avatars.githubusercontent.com/u/123456',
      websiteUrl: 'https://testuser.example.com',
      location: 'Test Location',
      telegramUrl: 'https://t.me/testuser',
      twitterUrl: 'https://twitter.com/testuser',
    };

    const response = await user.getMetricsApi().metricsGithubUserControllerCreateOne(userData);

    expect(response.data).toHaveProperty('id');
    expect(response.data.login).toContain('testuser');
    expect(response.data.name).toEqual('Test User');
    expect(response.data.email).toEqual('test@example.com');
  });

  // 3) Создать команду гитхаб
  it('should create a GitHub team', async () => {
    const teamData: CreateMetricsGithubTeamDto = {
      name: 'test-team-' + Date.now(),
      description: 'Test team for integration tests',
    };

    const response = await user.getMetricsApi().metricsGithubTeamControllerCreateOne(teamData);

    expect(response.data).toHaveProperty('id');
    expect(response.data.name).toContain('test-team');
    expect(response.data.description).toEqual('Test team for integration tests');
  });

  // 4) Привязать юзера к команде
  it('should bind a user to a team', async () => {
    // First create a team
    const teamResponse = await user.getMetricsApi().metricsGithubTeamControllerCreateOne({
      name: 'bind-test-team-' + Date.now(),
      description: 'Test team for binding user',
    });

    const team = teamResponse.data;

    // Then create a user
    const userResponse = await user.getMetricsApi().metricsGithubUserControllerCreateOne({
      login: 'bind-testuser-' + Date.now(),
      name: 'Bind Test User',
      email: 'bindtest@example.com',
      description: 'Test GitHub user for binding tests',
      avatarUrl: 'https://avatars.githubusercontent.com/u/123457',
      websiteUrl: 'https://bindtestuser.example.com',
      location: 'Bind Test Location',
      telegramUrl: 'https://t.me/bindtestuser',
      twitterUrl: 'https://twitter.com/bindtestuser',
    });

    const githubUser = userResponse.data;

    // Then bind user to team
    const teamUserData: CreateFullMetricsGithubTeamUserDto = {
      teamId: team.id,
      userId: githubUser.id,
      role: 'member',
    };

    const response = await user.getMetricsApi().metricsGithubTeamUserControllerCreateOne(teamUserData);

    expect(response.data).toHaveProperty('id');
    // Note: The response DTO doesn't include teamId and userId directly
    expect(response.data.role).toEqual('member');
  });

  // 5) Привязать репозиторий к команде
  it('should bind a repository to a team', async () => {
    // First create a team
    const teamResponse = await user.getMetricsApi().metricsGithubTeamControllerCreateOne({
      name: 'repo-team-' + Date.now(),
      description: 'Test team for repository binding',
    });

    const team = teamResponse.data;

    // Then create a repository
    const repoResponse = await user.getMetricsApi().metricsGithubRepositoryControllerCreateOne({
      name: 'team-test-repo-' + Date.now(),
      owner: 'test-owner',
      private: false,
      fork: false,
      description: 'Test repository for team binding',
      url: 'https://github.com/test-owner/team-test-repo',
    });

    const repository = repoResponse.data;

    // Then bind repository to team
    const teamRepoData: CreateFullMetricsGithubTeamRepositoryDto = {
      teamId: team.id,
      repositoryId: repository.id,
    };

    const response = await user.getMetricsApi().metricsGithubTeamRepositoryControllerCreateOne(teamRepoData);

    expect(response.data).toHaveProperty('id');
    // Note: The response DTO doesn't include teamId and repositoryId directly
  });

  // 6) Привязать репозиторий к юзеру
  it('should bind a repository to a user', async () => {
    // First create a user
    const userResponse = await user.getMetricsApi().metricsGithubUserControllerCreateOne({
      login: 'repo-user-' + Date.now(),
      name: 'Repo Test User',
      email: 'repotest@example.com',
      description: 'Test GitHub user for repository binding',
      avatarUrl: 'https://avatars.githubusercontent.com/u/123458',
      websiteUrl: 'https://repotestuser.example.com',
      location: 'Repo Test Location',
      telegramUrl: 'https://t.me/repotestuser',
      twitterUrl: 'https://twitter.com/repotestuser',
    });

    const githubUser = userResponse.data;

    // Then create a repository
    const repoResponse = await user.getMetricsApi().metricsGithubRepositoryControllerCreateOne({
      name: 'user-test-repo-' + Date.now(),
      owner: 'test-owner',
      private: false,
      fork: false,
      description: 'Test repository for user binding',
      url: 'https://github.com/test-owner/user-test-repo',
    });

    const repository = repoResponse.data;

    // Then bind repository to user
    const userRepoData: CreateFullMetricsGithubUserRepositoryDto = {
      userId: githubUser.id,
      repositoryId: repository.id,
      role: 'owner',
    };

    const response = await user.getMetricsApi().metricsGithubUserRepositoryControllerCreateOne(userRepoData);

    expect(response.data).toHaveProperty('id');
    // Note: The response DTO doesn't include userId and repositoryId directly
    expect(response.data.role).toEqual('owner');
  });
});
