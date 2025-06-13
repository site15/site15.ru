import { TokensResponse } from '@nestjs-mod/sso-rest-sdk';
import { SsoRestClientHelper } from '@nestjs-mod-sso/testing';

describe('Sso profile (e2e)', () => {
  let user: SsoRestClientHelper<'strict'>;
  let project: SsoRestClientHelper<'strict'>;

  let userTokens: TokensResponse;

  jest.setTimeout(5 * 60 * 1000);

  beforeAll(async () => {
    user = await new SsoRestClientHelper({
      headers: {
        'x-skip-throttle': process.env.SINGLE_SIGN_ON_SSO_ADMIN_SECRET,
      },
    }).generateRandomUser();
    project = await new SsoRestClientHelper({
      headers: {
        'x-skip-throttle': process.env.SINGLE_SIGN_ON_SSO_ADMIN_SECRET,
      },
    }).generateRandomUser();
  });

  it('Create project', async () => {
    const { data: createOneResult } = await user
      .getSsoApi()
      .ssoProjectsControllerCreateOne(
        {
          public: false,
          name: project.randomUser.uniqId,
          clientId: project.randomUser.id,
          clientSecret: project.randomUser.password,
        },
        {
          headers: {
            'x-admin-secret': process.env.SINGLE_SIGN_ON_SSO_ADMIN_SECRET,
          },
        }
      );
    expect(createOneResult).toHaveProperty('id');
  });

  it('Sign-up', async () => {
    const { data: signUpResult } = await user.getSsoApi().ssoControllerSignUp(
      {
        username: user.randomUser.username,
        email: user.randomUser.email,
        password: user.randomUser.password,
        confirmPassword: user.randomUser.password,
        fingerprint: user.randomUser.id,
      },
      {
        headers: {
          'x-client-id': project.randomUser.id,
        },
      }
    );
    expect(signUpResult).toHaveProperty('accessToken');
    expect(signUpResult).toHaveProperty('refreshToken');
    expect(signUpResult).toHaveProperty('user');
  });

  it('As admin set current date to emailVerifiedAt column', async () => {
    const { data: findManyProjectsResult } = await user
      .getSsoApi()
      .ssoProjectsControllerFindMany(
        undefined,
        undefined,
        project.randomUser.id,
        undefined,
        {
          headers: {
            'x-admin-secret': process.env.SINGLE_SIGN_ON_SSO_ADMIN_SECRET,
          },
        }
      );

    const { data: findManyResult } = await user
      .getSsoApi()
      .ssoUsersControllerFindMany(
        undefined,
        undefined,
        user.randomUser.email,
        undefined,
        findManyProjectsResult.ssoProjects[0].id,
        {
          headers: {
            'x-admin-secret': process.env.SINGLE_SIGN_ON_SSO_ADMIN_SECRET,
          },
        }
      );

    expect(findManyResult.ssoUsers).toHaveLength(1);

    const { data: updateOneResult } = await user
      .getSsoApi()
      .ssoUsersControllerUpdateOne(
        findManyResult.ssoUsers[0].id,
        {
          emailVerifiedAt: new Date().toISOString(),
        },
        {
          headers: {
            'x-admin-secret': process.env.SINGLE_SIGN_ON_SSO_ADMIN_SECRET,
          },
        }
      );

    expect(updateOneResult.emailVerifiedAt).not.toBeNull();
  });

  it('Sign-in', async () => {
    const { data: signInResult } = await user.getSsoApi().ssoControllerSignIn(
      {
        email: user.randomUser.email,
        password: user.randomUser.password,
        fingerprint: user.randomUser.id,
      },
      {
        headers: {
          'x-client-id': project.randomUser.id,
        },
      }
    );
    expect(signInResult).toHaveProperty('accessToken');
    expect(signInResult).toHaveProperty('refreshToken');
    expect(signInResult).toHaveProperty('user');
    userTokens = signInResult;
  });

  it('Update user profile data', async () => {
    const { data: profileResult } = await user
      .getSsoApi()
      .ssoControllerProfile({
        headers: {
          ...(userTokens.accessToken
            ? { Authorization: `Bearer ${userTokens.accessToken}` }
            : {}),
          'x-client-id': project.randomUser.id,
        },
      });
    const { data: updatedProfileResult } = await user
      .getSsoApi()
      .ssoControllerUpdateProfile(
        {
          firstname: user.randomUser.firstName,
          birthdate: user.randomUser.dateOfBirth.toISOString(),
          gender: 'm',
          lastname: user.randomUser.lastName,
          picture: 'pic',
        },
        {
          headers: {
            ...(userTokens.accessToken
              ? { Authorization: `Bearer ${userTokens.accessToken}` }
              : {}),
            'x-client-id': project.randomUser.id,
          },
        }
      );
    expect(profileResult).toMatchObject({
      email: user.randomUser.email,
      phone: null,
      username: user.randomUser.username,
      roles: 'user',
      firstname: null,
      lastname: null,
      gender: null,
      birthdate: null,
      picture: null,
      appData: null,
      revokedAt: null,
      // emailVerifiedAt: '2025-02-26T06:57:00.949Z',
      phoneVerifiedAt: null,
      // createdAt: '2025-02-26T06:57:00.930Z',
      // updatedAt: '2025-02-26T06:57:00.953Z',
    });
    expect(profileResult.emailVerifiedAt).toBeDefined();
    expect(profileResult.createdAt).toBeDefined();
    expect(profileResult.updatedAt).toBeDefined();
    expect(profileResult.createdAt).not.toEqual(profileResult.updatedAt);

    expect(updatedProfileResult).toMatchObject({
      id: profileResult.id,
      email: user.randomUser.email,
      phone: null,
      username: user.randomUser.username,
      roles: 'user',
      firstname: user.randomUser.firstName,
      lastname: user.randomUser.lastName,
      gender: 'm',
      birthdate: user.randomUser.dateOfBirth.toISOString(),
      picture: 'pic',
      appData: null,
      revokedAt: null,
      emailVerifiedAt: profileResult.emailVerifiedAt,
      phoneVerifiedAt: null,
      createdAt: profileResult.createdAt,
      // updatedAt: '2025-02-26T06:57:00.953Z',
    });
    expect(updatedProfileResult.updatedAt).toBeDefined();
    expect(profileResult.updatedAt).not.toEqual(updatedProfileResult.updatedAt);
  });
});
