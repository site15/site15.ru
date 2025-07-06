import { SsoRestClientHelper } from '@site15/testing';
describe('OAuth (e2e)', () => {
  jest.setTimeout(60000);

  let user: SsoRestClientHelper<'strict'>;

  beforeAll(async () => {
    user = await new SsoRestClientHelper({
      headers: {
        'x-skip-throttle': process.env.SITE_15_SSO_ADMIN_SECRET,
      },
    }).generateRandomUser();
  });

  it('Get providers', async () => {
    const { data } = await user.getSsoApi().ssoOAuthControllerOauthProviders();
    expect(data.length).toBeGreaterThan(0);
    expect(data.find((p) => p.name === 'google')?.name).toEqual('google');
  });
});
