import {
  SsoError,
  SsoErrorEnum,
  TokensResponse,
} from '@nestjs-mod-sso/app-rest-sdk';
import { getErrorData, RestClientHelper } from '@nestjs-mod-sso/testing';

describe('Sso profile (e2e)', () => {
  let user: RestClientHelper<'strict'>;
  let project: RestClientHelper<'strict'>;

  let userTokens: TokensResponse;

  jest.setTimeout(5 * 60 * 1000);

  beforeAll(async () => {
    user = await new RestClientHelper().generateRandomUser();
    project = await new RestClientHelper().generateRandomUser();
  });

  it('Create project', async () => {
    const { data: createOneResult } = await user
      .getSsoApi()
      .ssoProjectsControllerCreateOne(
        {
          clientId: project.randomUser.id,
          clientSecret: project.randomUser.password,
        },
        {
          headers: { 'x-admin-secret': process.env.SERVER_SSO_ADMIN_SECRET },
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
    const { data: findManyResult } = await user
      .getSsoApi()
      .ssoUsersControllerFindMany(
        undefined,
        undefined,
        user.randomUser.email,
        undefined,
        {
          headers: { 'x-admin-secret': process.env.SERVER_SSO_ADMIN_SECRET },
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
          headers: { 'x-admin-secret': process.env.SERVER_SSO_ADMIN_SECRET },
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
          'x-client-id': project.randomUser.id,
          Authorization: `Bearer ${userTokens.accessToken}`,
        },
      });
    const { data: updateProfileResult } = await user
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
            'x-client-id': project.randomUser.id,
            Authorization: `Bearer ${userTokens.accessToken}`,
          },
        }
      );
    expect(profileResult).toMatchObject({
      email: user.randomUser.email,
      phone: null,
      username: user.randomUser.username,
      roles: null,
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

    expect(updateProfileResult).toMatchObject({
      id: profileResult.id,
      email: user.randomUser.email,
      phone: null,
      username: user.randomUser.username,
      roles: null,
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
    expect(updateProfileResult.updatedAt).toBeDefined();
    expect(profileResult.updatedAt).not.toEqual(updateProfileResult.updatedAt);
  });

  it("Let's try to change the password by updating the user profile data, and we get an error when trying to use the new password, since the password cannot be changed by updating the profile", async () => {
    const { data: updateProfileResult } = await user
      .getSsoApi()
      .ssoControllerUpdateProfile(
        {
          password: 'hack',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        {
          headers: {
            'x-client-id': project.randomUser.id,
            Authorization: `Bearer ${userTokens.accessToken}`,
          },
        }
      );
    expect(updateProfileResult).toHaveProperty('id');

    try {
      await user.getSsoApi().ssoControllerSignIn(
        {
          email: user.randomUser.email,
          password: 'hack',
          fingerprint: user.randomUser.id,
        },
        {
          headers: {
            'x-client-id': project.randomUser.id,
          },
        }
      );
    } catch (err) {
      const errData = getErrorData<SsoError>(err);
      expect(errData).not.toEqual(null);
      expect(errData?.code).toEqual(SsoErrorEnum.Sso002);
      expect(errData?.message).toEqual('Wrong password');
    }
  });
});
