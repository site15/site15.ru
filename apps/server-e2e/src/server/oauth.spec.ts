import { RestClientHelper } from '@nestjs-mod-sso/testing';
describe('OAuth (e2e)', () => {
  jest.setTimeout(60000);

  let user: RestClientHelper<'strict'>;

  beforeAll(async () => {
    user = await new RestClientHelper({
      headers: {
        'x-skip-throttle': process.env.SERVER_SSO_ADMIN_SECRET,
      },
    }).generateRandomUser();
  });

  it('Get providers', async () => {
    const { data } = await user.getSsoApi().ssoOAuthControllerOauthProviders();
    expect(data.length).toBeGreaterThan(0);
    expect(data.find((p) => p.name === 'google')?.name).toEqual('google');
  });
});
