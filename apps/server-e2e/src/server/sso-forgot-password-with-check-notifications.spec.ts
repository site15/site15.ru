import { TokensResponse } from '@nestjs-mod-sso/app-rest-sdk';
import { RestClientHelper } from '@nestjs-mod-sso/testing';

describe('Sso forgot password with check notifications (e2e)', () => {
  let user: RestClientHelper<'strict'>;
  let admin: RestClientHelper<'strict'>;
  let project: RestClientHelper<'strict'>;

  let userTokens: TokensResponse;

  jest.setTimeout(5 * 60 * 1000);

  beforeAll(async () => {
    project = await new RestClientHelper().generateRandomUser();
    user = await new RestClientHelper({
      headers: {
        'x-client-id': project.randomUser.id,
      },
    }).generateRandomUser();
    admin = new RestClientHelper({
      headers: {
        'x-admin-secret': process.env.SERVER_SSO_ADMIN_SECRET,
        'x-client-id': project.randomUser.id,
      },
    });
  });

  it('Create project', async () => {
    const { data: createOneResult } = await admin
      .getSsoApi()
      .ssoProjectsControllerCreateOne({
        clientId: project.randomUser.id,
        clientSecret: project.randomUser.password,
      });
    expect(createOneResult).toHaveProperty('id');
  });

  it('Sign-up', async () => {
    const { data: signUpResult } = await user.getSsoApi().ssoControllerSignUp({
      username: user.randomUser.username,
      email: user.randomUser.email,
      password: user.randomUser.password,
      confirmPassword: user.randomUser.password,
      fingerprint: user.randomUser.id,
    });

    expect(signUpResult).toHaveProperty('accessToken');
    expect(signUpResult).toHaveProperty('refreshToken');
    expect(signUpResult).toHaveProperty('user');
  });

  it('As admin get verify code from notifications and use it for verify as user', async () => {
    const { data: findManyResult } = await admin
      .getNotificationsApi()
      .notificationsControllerFindMany(
        undefined,
        undefined,
        user.randomUser.email,
        undefined
      );
    expect(findManyResult.notifications).toHaveLength(1);
    const code = findManyResult.notifications[0].html
      .split('?code=')[1]
      .split('"')[0];

    const { data: completeSignUpResult } = await user
      .getSsoApi()
      .ssoControllerCompleteSignUp(code, { fingerprint: user.randomUser.id });

    expect(completeSignUpResult).toHaveProperty('accessToken');
    expect(completeSignUpResult).toHaveProperty('refreshToken');
    expect(completeSignUpResult).toHaveProperty('user');

    // check tokens
    const { data: profileResult } = await user
      .getSsoApi()
      .ssoControllerProfile({
        headers: {
          ...(completeSignUpResult.accessToken
            ? { Authorization: `Bearer ${completeSignUpResult.accessToken}` }
            : {}),
        },
      });

    expect(profileResult.email).toEqual(user.randomUser.email);
  });

  it('Sign-in', async () => {
    const { data: signInResult } = await user.getSsoApi().ssoControllerSignIn({
      email: user.randomUser.email,
      password: user.randomUser.password,
      fingerprint: user.randomUser.id,
    });
    expect(signInResult).toHaveProperty('accessToken');
    expect(signInResult).toHaveProperty('refreshToken');
    expect(signInResult).toHaveProperty('user');
    userTokens = signInResult;
  });

  it('Send link for restore forget password with change password logic', async () => {
    const { data: forgotPasswordResult } = await user
      .getSsoApi()
      .ssoControllerForgotPassword(
        { email: user.randomUser.email },
        {
          headers: {
            'x-client-id': project.randomUser.id,
          },
        }
      );
    expect(forgotPasswordResult).toMatchObject({ message: 'ok' });
  });

  it('As admin get complete forgot password code from notifications and use it for change password', async () => {
    const { data: findManyResult } = await admin
      .getNotificationsApi()
      .notificationsControllerFindMany(
        undefined,
        undefined,
        user.randomUser.email,
        undefined
      );
    expect(findManyResult.notifications).toHaveLength(2);
    const code = findManyResult.notifications[0].html
      .split('?code=')[1]
      .split('"')[0];

    const { data: completeForgotPasswordResult } = await user
      .getSsoApi()
      .ssoControllerCompleteForgotPassword(code, {
        password: user.randomUser.newPassword,
        confirmPassword: user.randomUser.newPassword,
        fingerprint: user.randomUser.id,
      });

    expect(completeForgotPasswordResult).toHaveProperty('accessToken');
    expect(completeForgotPasswordResult).toHaveProperty('refreshToken');
    expect(completeForgotPasswordResult).toHaveProperty('user');

    // check tokens
    const { data: profileResult } = await user
      .getSsoApi()
      .ssoControllerProfile({
        headers: {
          ...(completeForgotPasswordResult.accessToken
            ? {
                Authorization: `Bearer ${completeForgotPasswordResult.accessToken}`,
              }
            : {}),
        },
      });

    expect(profileResult.email).toEqual(user.randomUser.email);
  });

  it('Sign-in with new password', async () => {
    const { data: signInResult } = await user.getSsoApi().ssoControllerSignIn({
      email: user.randomUser.email,
      password: user.randomUser.newPassword,
      fingerprint: user.randomUser.id,
    });
    expect(signInResult).toHaveProperty('accessToken');
    expect(signInResult).toHaveProperty('refreshToken');
    expect(signInResult).toHaveProperty('user');
    userTokens = signInResult;
  });

  it('Should refresh tokens successfully', async () => {
    const { data: refreshTokensResult } = await user
      .getSsoApi()
      .ssoControllerRefreshTokens({
        fingerprint: user.randomUser.id,
        refreshToken: userTokens.refreshToken,
      });
    expect(refreshTokensResult).toHaveProperty('accessToken');
    expect(refreshTokensResult).toHaveProperty('refreshToken');
    expect(refreshTokensResult).toHaveProperty('user');
    userTokens = refreshTokensResult;
  });

  it('Sign-out', async () => {
    const { data: signOutResult } = await user.getSsoApi().ssoControllerSignOut(
      { refreshToken: userTokens.refreshToken },
      {
        headers: {
          ...(userTokens.accessToken
            ? { Authorization: `Bearer ${userTokens.accessToken}` }
            : {}),
        },
      }
    );
    expect(signOutResult.message).toEqual('ok');
  });
});
