import { TokensResponse } from '@nestjs-mod/sso-rest-sdk';
import { SsoRestClientHelper } from '@site15/testing';

describe('Sso profile (e2e)', () => {
  let user: SsoRestClientHelper<'strict'>;
  let tenant: SsoRestClientHelper<'strict'>;

  let userTokens: TokensResponse;

  jest.setTimeout(5 * 60 * 1000);

  beforeAll(async () => {
    user = await new SsoRestClientHelper({
      headers: {
        'x-skip-throttle': process.env.SITE_15_SSO_ADMIN_SECRET,
        'x-skip-email-verification': process.env.SITE_15_SSO_ADMIN_SECRET,
      },
    }).generateRandomUser();
    tenant = await new SsoRestClientHelper({
      headers: {
        'x-skip-throttle': process.env.SITE_15_SSO_ADMIN_SECRET,
        'x-skip-email-verification': process.env.SITE_15_SSO_ADMIN_SECRET,
      },
    }).generateRandomUser();
  });

  it('Create tenant', async () => {
    const { data: createOneResult } = await user.getSsoApi().ssoTenantsControllerCreateOne(
      {
        public: false,
        name: tenant.randomUser.uniqId,
        clientId: tenant.randomUser.id,
        clientSecret: tenant.randomUser.password,
        enabled: true,
        slug: tenant.randomUser.domainWord,
      },
      {
        headers: {
          'x-admin-secret': process.env.SITE_15_SSO_ADMIN_SECRET,
        },
      },
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
          'x-client-id': tenant.randomUser.id,
        },
      },
    );
    expect(signUpResult).toHaveProperty('accessToken');
    expect(signUpResult).toHaveProperty('refreshToken');
    expect(signUpResult).toHaveProperty('user');
  });

  it('As admin set current date to emailVerifiedAt column', async () => {
    const { data: findManyTenantsResult } = await user
      .getSsoApi()
      .ssoTenantsControllerFindMany(undefined, undefined, tenant.randomUser.id, undefined, {
        headers: {
          'x-admin-secret': process.env.SITE_15_SSO_ADMIN_SECRET,
        },
      });

    const { data: findManyResult } = await user
      .getSsoApi()
      .ssoUsersControllerFindMany(
        undefined,
        undefined,
        user.randomUser.email,
        undefined,
        findManyTenantsResult.ssoTenants[0].id,
        {
          headers: {
            'x-admin-secret': process.env.SITE_15_SSO_ADMIN_SECRET,
          },
        },
      );

    expect(findManyResult.ssoUsers).toHaveLength(1);

    const { data: updateOneResult } = await user.getSsoApi().ssoUsersControllerUpdateOne(
      findManyResult.ssoUsers[0].id,
      {
        emailVerifiedAt: new Date().toISOString(),
      },
      {
        headers: {
          'x-admin-secret': process.env.SITE_15_SSO_ADMIN_SECRET,
        },
      },
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
          'x-client-id': tenant.randomUser.id,
        },
      },
    );
    expect(signInResult).toHaveProperty('accessToken');
    expect(signInResult).toHaveProperty('refreshToken');
    expect(signInResult).toHaveProperty('user');
    userTokens = signInResult;
  });

  it('Update user profile data', async () => {
    const { data: profileResult } = await user.getSsoApi().ssoControllerProfile({
      headers: {
        ...(userTokens.accessToken ? { Authorization: `Bearer ${userTokens.accessToken}` } : {}),
        'x-client-id': tenant.randomUser.id,
      },
    });
    const { data: updatedProfileResult } = await user.getSsoApi().ssoControllerUpdateProfile(
      {
        firstname: user.randomUser.firstName,
        birthdate: user.randomUser.dateOfBirth.toISOString(),
        gender: 'm',
        lastname: user.randomUser.lastName,
        picture: 'pic',
      },
      {
        headers: {
          ...(userTokens.accessToken ? { Authorization: `Bearer ${userTokens.accessToken}` } : {}),
          'x-client-id': tenant.randomUser.id,
        },
      },
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
