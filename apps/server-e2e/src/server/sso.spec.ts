import {
  SsoError,
  SsoErrorEnum,
  TokensResponse,
  ValidationError,
  ValidationErrorEnum,
} from '@nestjs-mod/sso-rest-sdk';
import { getErrorData, SsoRestClientHelper } from '@nestjs-mod-sso/testing';
import { randomUUID } from 'node:crypto';

describe('Sso (e2e)', () => {
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

  it('English error in try create project with wrong admin secret key', async () => {
    try {
      await user.getSsoApi().ssoProjectsControllerCreateOne(
        {
          public: false,
          name: project.randomUser.uniqId,
          clientId: project.randomUser.id,
          clientSecret: project.randomUser.password,
        },
        {
          headers: { 'x-admin-secret': 'wrong' },
        }
      );
      expect(true).toEqual(false);
    } catch (err) {
      const errData = getErrorData<SsoError>(err);
      expect(errData).not.toEqual(null);
      expect(errData?.code).toEqual(SsoErrorEnum.Sso013);
      expect(errData?.message).toEqual('Forbidden');
    }
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

  it('English validation errors in sign-up with not equals password', async () => {
    try {
      await user.getSsoApi().ssoControllerSignUp(
        {
          username: user.randomUser.username,
          email: user.randomUser.email,
          password: user.randomUser.password,
          confirmPassword: user.randomUser.newPassword,
          fingerprint: user.randomUser.id,
        },
        {
          headers: {
            'x-client-id': project.randomUser.id,
          },
        }
      );
      expect(true).toEqual(false);
    } catch (err) {
      const errData = getErrorData<ValidationError>(err);
      expect(errData).not.toEqual(null);
      expect(errData?.code).toEqual(ValidationErrorEnum.Validation000);
      expect(errData?.metadata).toEqual([
        {
          property: 'confirmPassword',
          constraints: [
            {
              name: 'equalsTo',
              description: 'password do not match to confirmPassword',
            },
          ],
        },
      ]);
    }
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

  it('English errors in sign-in not exists user', async () => {
    try {
      await user.getSsoApi().ssoControllerSignIn(
        {
          email: 'fake_' + user.randomUser.email,
          password: user.randomUser.password,
          fingerprint: user.randomUser.id,
        },
        {
          headers: {
            'x-client-id': project.randomUser.id,
          },
        }
      );
      expect(true).toEqual(false);
    } catch (err) {
      const errData = getErrorData<SsoError>(err);
      expect(errData).not.toEqual(null);
      expect(errData?.code).toEqual(SsoErrorEnum.Sso001);
      expect(errData?.message).toEqual('User not found');
    }
  });

  it('English validation errors in sign-in with empty password', async () => {
    try {
      await user.getSsoApi().ssoControllerSignIn(
        {
          email: user.randomUser.email,
          password: '',
          fingerprint: user.randomUser.id,
        },
        {
          headers: {
            'x-client-id': project.randomUser.id,
          },
        }
      );
      expect(true).toEqual(false);
    } catch (err) {
      const errData = getErrorData<ValidationError>(err);
      expect(errData).not.toEqual(null);
      expect(errData?.code).toEqual(ValidationErrorEnum.Validation000);
      expect(errData?.metadata).toEqual([
        {
          property: 'password',
          constraints: [
            {
              name: 'isNotEmpty',
              description: 'password should not be empty',
            },
          ],
        },
      ]);
    }
  });

  it('English errors in sign-in not verified email', async () => {
    try {
      await user.getSsoApi().ssoControllerSignIn(
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
    } catch (err) {
      const errData = getErrorData<SsoError>(err);
      expect(errData).not.toEqual(null);
      expect(errData?.code).toEqual(SsoErrorEnum.Sso012);
      expect(errData?.message).toEqual('Email not verified');
    }
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

  it('English errors in change password about empty password and confirmPassword fields', async () => {
    try {
      await user.getSsoApi().ssoControllerUpdateProfile(
        {
          password: '',
          confirmPassword: '',
        },
        {
          headers: {
            'x-client-id': project.randomUser.id,
            ...(userTokens.accessToken
              ? { Authorization: `Bearer ${userTokens.accessToken}` }
              : {}),
          },
        }
      );
    } catch (err) {
      const errData = getErrorData<ValidationError>(err);
      expect(errData).not.toEqual(null);
      expect(errData?.code).toEqual(ValidationErrorEnum.Validation000);
      expect(errData?.metadata).toEqual([
        {
          property: 'password',
          constraints: [
            {
              name: 'isNotEmpty',
              description: 'password should not be empty',
            },
          ],
        },
        {
          property: 'confirmPassword',
          constraints: [
            {
              name: 'isNotEmpty',
              description: 'confirmPassword should not be empty',
            },
          ],
        },
      ]);
    }
  });

  it('English errors in change password about empty password fields', async () => {
    try {
      await user.getSsoApi().ssoControllerUpdateProfile(
        {
          password: user.randomUser.newPassword,
          confirmPassword: '',
        },
        {
          headers: {
            'x-client-id': project.randomUser.id,
            ...(userTokens.accessToken
              ? { Authorization: `Bearer ${userTokens.accessToken}` }
              : {}),
          },
        }
      );
    } catch (err) {
      const errData = getErrorData<ValidationError>(err);
      expect(errData).not.toEqual(null);
      expect(errData?.code).toEqual(ValidationErrorEnum.Validation000);
      expect(errData?.metadata).toEqual([
        {
          property: 'confirmPassword',
          constraints: [
            {
              name: 'equalsTo',
              description: 'password do not match to confirmPassword',
            },
          ],
        },
      ]);
    }
  });

  it('Change password', async () => {
    const { data: changePasswordResult } = await user
      .getSsoApi()
      .ssoControllerUpdateProfile(
        {
          password: user.randomUser.newPassword,
          confirmPassword: user.randomUser.newPassword,
          oldPassword: user.randomUser.password,
        },
        {
          headers: {
            'x-client-id': project.randomUser.id,
            ...(userTokens.accessToken
              ? { Authorization: `Bearer ${userTokens.accessToken}` }
              : {}),
          },
        }
      );
    expect(changePasswordResult).toHaveProperty('id');
  });

  it('English errors in sign-in with old password', async () => {
    try {
      await user.getSsoApi().ssoControllerSignIn(
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
    } catch (err) {
      const errData = getErrorData<SsoError>(err);
      expect(errData).not.toEqual(null);
      expect(errData?.code).toEqual(SsoErrorEnum.Sso002);
      expect(errData?.message).toEqual('Wrong password');
    }
  });

  it('Sign-in with new password', async () => {
    const { data: signInResult } = await user.getSsoApi().ssoControllerSignIn(
      {
        email: user.randomUser.email,
        password: user.randomUser.newPassword,
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

  it('English errors in refresh tokens method called with wrong refresh-token', async () => {
    try {
      await user.getSsoApi().ssoControllerRefreshTokens(
        {
          fingerprint: user.randomUser.id,
          refreshToken: randomUUID(),
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
      expect(errData?.code).toEqual(SsoErrorEnum.Sso007);
      expect(errData?.message).toEqual('Refresh token not provided');
    }
  });

  it('Should refresh tokens successfully', async () => {
    const { data: refreshTokensResult } = await user
      .getSsoApi()
      .ssoControllerRefreshTokens(
        {
          fingerprint: user.randomUser.id,
          refreshToken: userTokens.refreshToken,
        },
        {
          headers: {
            'x-client-id': project.randomUser.id,
          },
        }
      );
    expect(refreshTokensResult).toHaveProperty('accessToken');
    expect(refreshTokensResult).toHaveProperty('refreshToken');
    expect(refreshTokensResult).toHaveProperty('user');
    userTokens = refreshTokensResult;
  });

  it('English errors in sign-out method called with wrong refresh-token', async () => {
    try {
      await user.getSsoApi().ssoControllerSignOut(
        { refreshToken: randomUUID() },
        {
          headers: {
            'x-client-id': project.randomUser.id,
          },
        }
      );
    } catch (err) {
      const errData = getErrorData<SsoError>(err);
      expect(errData).not.toEqual(null);
      expect(errData?.code).toEqual(SsoErrorEnum.Sso013);
      expect(errData?.message).toEqual('Forbidden');
    }
  });

  it('Sign-out', async () => {
    const { data: signOutResult } = await user.getSsoApi().ssoControllerSignOut(
      { refreshToken: userTokens.refreshToken },
      {
        headers: {
          'x-client-id': project.randomUser.id,
          ...(userTokens.accessToken
            ? { Authorization: `Bearer ${userTokens.accessToken}` }
            : {}),
        },
      }
    );
    expect(signOutResult.message).toEqual('ok');
  });

  it('English errors in sign-out method called with old refresh-token', async () => {
    try {
      await user.getSsoApi().ssoControllerSignOut(
        { refreshToken: userTokens.refreshToken },
        {
          headers: {
            'x-client-id': project.randomUser.id,
            ...(userTokens.accessToken
              ? { Authorization: `Bearer ${userTokens.accessToken}` }
              : {}),
          },
        }
      );
    } catch (err) {
      const errData = getErrorData<SsoError>(err);
      expect(errData).not.toEqual(null);
      expect(errData?.code).toEqual(SsoErrorEnum.Sso013);
      expect(errData?.message).toEqual('Forbidden');
    }
  });
});
