import { SsoRole } from '@nestjs-mod/sso-rest-sdk';
import { SsoRestClientHelper } from '@nestjs-mod-sso/testing';
import { AxiosError } from 'axios';

describe('Store lang in db', () => {
  jest.setTimeout(60000);

  const user1 = new SsoRestClientHelper({
    headers: {
      'x-skip-throttle': process.env.SINGLE_SIGN_ON_SSO_ADMIN_SECRET,
    },
  });
  const admin = new SsoRestClientHelper({
    headers: {
      'x-admin-secret': process.env.SINGLE_SIGN_ON_SSO_ADMIN_SECRET,
      'x-skip-throttle': process.env.SINGLE_SIGN_ON_SSO_ADMIN_SECRET,
    },
  });

  beforeAll(async () => {
    await user1.createAndLoginAsUser();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await admin.setRoles(user1.getSsoProfile()!.id, [SsoRole.Manager]);
  });

  it('should catch error on try use not exists language code', async () => {
    try {
      await user1.getSsoApi().ssoControllerUpdateProfile({ lang: 'tt' });
    } catch (err) {
      expect((err as AxiosError).response?.data).toEqual({
        code: 'VALIDATION-000',
        message: 'Validation error',
        metadata: [
          {
            property: 'lang',
            constraints: [
              {
                name: 'isWrongEnumValue',
                description: 'lang must have one of the values: en, ru',
              },
            ],
          },
        ],
      });
    }
  });

  it('should catch error in Russian language on create new webhook as user1', async () => {
    await user1.getSsoApi().ssoControllerUpdateProfile({ lang: 'ru' });
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
                description: 'eventName не может быть пустым',
              },
            ],
          },
          {
            property: 'endpoint',
            constraints: [
              {
                name: 'isNotEmpty',
                description: 'endpoint не может быть пустым',
              },
            ],
          },
        ],
      });
    }
  });
});
