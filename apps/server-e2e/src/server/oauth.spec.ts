import { Site15RestClientHelper } from '@site15/testing';
describe('OAuth (e2e)', () => {
  jest.setTimeout(60000);

  let user: Site15RestClientHelper<'strict'>;

  beforeAll(async () => {
    user = await new Site15RestClientHelper({
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
