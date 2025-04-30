import { SsoRole } from '@nestjs-mod-sso/app-rest-sdk';
import { RestClientHelper } from '@nestjs-mod-sso/testing';
import { AxiosError } from 'axios';

describe('Validation', () => {
  jest.setTimeout(60000);

  const user1 = new RestClientHelper({
    headers: {
      'x-skip-throttle': process.env.SERVER_SSO_ADMIN_SECRET,
    },
  });
  const admin = new RestClientHelper({
    headers: {
      'x-admin-secret': process.env.SERVER_SSO_ADMIN_SECRET,
      'x-skip-throttle': process.env.SERVER_SSO_ADMIN_SECRET,
    },
  });

  beforeAll(async () => {
    await user1.createAndLoginAsUser();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await admin.setRoles(user1.getSsoProfile()!.id, [SsoRole.Manager]);
  });

  it('should catch error on create new webhook as user1', async () => {
    try {
      await user1.getWebhookApi().webhookControllerCreateOne({
        enabled: false,
        endpoint: '',
        eventName: '',
      });
    } catch (err) {
      expect((err as AxiosError).response?.data).toEqual({
        code: 'VALIDATION-000',
        message: 'Validation error',
        metadata: [
          {
            property: 'eventName',
            constraints: [
              {
                name: 'isNotEmpty',
                description: 'eventName should not be empty',
              },
            ],
          },
          {
            property: 'endpoint',
            constraints: [
              {
                name: 'isNotEmpty',
                description: 'endpoint should not be empty',
              },
            ],
          },
        ],
      });
    }
  });
});
