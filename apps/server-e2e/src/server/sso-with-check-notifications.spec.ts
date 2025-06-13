import { TokensResponse } from '@nestjs-mod/sso-rest-sdk';
import { SsoRestClientHelper } from '@nestjs-mod-sso/testing';

describe('Sso with check notifications (e2e)', () => {
  let user: SsoRestClientHelper<'strict'>;
  let admin: SsoRestClientHelper<'strict'>;
  let project: SsoRestClientHelper<'strict'>;

  let userTokens: TokensResponse;

  jest.setTimeout(5 * 60 * 1000);

  beforeAll(async () => {
    project = await new SsoRestClientHelper({
      headers: {
        'x-skip-throttle': process.env.SINGLE_SIGN_ON_SSO_ADMIN_SECRET,
      },
    }).generateRandomUser();
    user = await new SsoRestClientHelper({
      headers: {
        'x-client-id': project.randomUser.id,
        'x-skip-throttle': process.env.SINGLE_SIGN_ON_SSO_ADMIN_SECRET,
      },
    }).generateRandomUser();
    admin = new SsoRestClientHelper({
      headers: {
        'x-admin-secret': process.env.SINGLE_SIGN_ON_SSO_ADMIN_SECRET,
        'x-skip-throttle': process.env.SINGLE_SIGN_ON_SSO_ADMIN_SECRET,
      },
    });
  });

  it('Create project', async () => {
    const { data: createOneResult } = await admin
      .getSsoApi()
      .ssoProjectsControllerCreateOne({
        public: false,
        name: project.randomUser.uniqId,
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
        undefined,
        {
          headers: {
            'x-client-id': project.randomUser.id,
          },
        }
      );
    expect(findManyResult.notifications).toHaveLength(1);
    const code = findManyResult.notifications[0].html
      .split('?code=')[1]
      .split('&')[0]
      .split('"')[0];

    const { data: completeSignUpResult } = await user
      .getSsoApi()
      .ssoControllerCompleteSignUp({ code, fingerprint: user.randomUser.id });

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
            ...(userTokens.accessToken
              ? { Authorization: `Bearer ${userTokens.accessToken}` }
              : {}),
          },
        }
      );
    expect(changePasswordResult).toHaveProperty('id');
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
