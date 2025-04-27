import { RestClientHelper } from '@nestjs-mod-sso/testing';
describe('OAuth (e2e)', () => {
  jest.setTimeout(60000);

  let user: RestClientHelper<'strict'>;

  beforeAll(async () => {
    user = await new RestClientHelper().generateRandomUser();
  });

  it('Get providers', async () => {
    const { data } = await user.getSsoApi().ssoOAuthControllerOauthProviders();
    expect(data.length).toBeGreaterThan(0);
    expect(data.find((p) => p.name === 'google')?.name).toEqual('google');
  });
});
