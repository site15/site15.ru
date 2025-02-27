import {
  SsoError,
  SsoErrorEnum,
  TokensResponse,
  ValidationError,
  ValidationErrorEnum,
} from '@nestjs-mod-sso/app-rest-sdk';
import { getErrorData, RestClientHelper } from '@nestjs-mod-sso/testing';
import { randomUUID } from 'node:crypto';

describe('Auth (e2e)', () => {
  let user: RestClientHelper<'strict'>;
  let project: RestClientHelper<'strict'>;

  let userTokens: TokensResponse;

  jest.setTimeout(5 * 60 * 1000);

  beforeAll(async () => {
    user = await new RestClientHelper().generateRandomUser();
    project = await new RestClientHelper().generateRandomUser();
  });

  it('English error in try create project with wrong admin secret key', async () => {
    try {
      await user.getSsoApi().ssoProjectsControllerCreateOne(
        {
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
          clientId: project.randomUser.id,
          clientSecret: project.randomUser.password,
        },
        {
          headers: { 'x-admin-secret': process.env.SERVER_SSO_ADMIN_SECRET },
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
          rePassword: user.randomUser.newPassword,
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
          property: 'rePassword',
          constraints: [
            {
              name: 'equalsTo',
              description: 'password do not match to rePassword',
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
        rePassword: user.randomUser.password,
        fingerprint: user.randomUser.id,
      },
      {
        headers: {
          'x-client-id': project.randomUser.id,
        },
      }
    );
    expect(signUpResult).toMatchObject({ message: 'ok' });
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
    userTokens = signInResult;
  });

  it('English errors in change password about empty password and rePassword fields', async () => {
    try {
      await user.getSsoApi().ssoControllerChangePassword(
        {
          password: '',
          rePassword: '',
        },
        {
          headers: {
            'x-client-id': project.randomUser.id,
            Authorization: `Bearer ${userTokens.accessToken}`,
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
          property: 'rePassword',
          constraints: [
            {
              name: 'isNotEmpty',
              description: 'rePassword should not be empty',
            },
          ],
        },
      ]);
    }
  });
  it('English errors in change password about empty password fields', async () => {
    try {
      await user.getSsoApi().ssoControllerChangePassword(
        {
          password: user.randomUser.newPassword,
          rePassword: '',
        },
        {
          headers: {
            'x-client-id': project.randomUser.id,
            Authorization: `Bearer ${userTokens.accessToken}`,
          },
        }
      );
    } catch (err) {
      const errData = getErrorData<ValidationError>(err);
      expect(errData).not.toEqual(null);
      expect(errData?.code).toEqual(ValidationErrorEnum.Validation000);
      expect(errData?.metadata).toEqual([
        {
          property: 'rePassword',
          constraints: [
            {
              name: 'equalsTo',
              description: 'password do not match to rePassword',
            },
            {
              name: 'isNotEmpty',
              description: 'rePassword should not be empty',
            },
          ],
        },
      ]);
    }
  });

  it('Change password', async () => {
    const { data: changePasswordResult } = await user
      .getSsoApi()
      .ssoControllerChangePassword(
        {
          password: user.randomUser.newPassword,
          rePassword: user.randomUser.newPassword,
        },
        {
          headers: {
            'x-client-id': project.randomUser.id,
            Authorization: `Bearer ${userTokens.accessToken}`,
          },
        }
      );
    expect(changePasswordResult).toMatchObject({ message: 'ok' });
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
      expect(errData?.code).toEqual(SsoErrorEnum.Sso007);
      expect(errData?.message).toEqual('Refresh token not provided');
    }
  });

  it('Sign-out', async () => {
    const { data: signOutResult } = await user.getSsoApi().ssoControllerSignOut(
      { refreshToken: userTokens.refreshToken },
      {
        headers: {
          'x-client-id': project.randomUser.id,
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
});
