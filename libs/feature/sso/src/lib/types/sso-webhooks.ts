import { WebhookEvent } from '@nestjs-mod/webhook';
import { getText } from 'nestjs-translates';
import { SsoUserDto } from '../generated/rest/dto/sso-user.dto';

export enum SsoWebhookEvent {
  'sso.sign-up' = 'sso.sign-up',
  'sso.sign-in' = 'sso.sign-in',
  'sso.complete-sign-up' = 'sso.complete-sign-up',
  'sso.sign-out' = 'sso.sign-out',
  'sso.forgot-password' = 'sso.forgot-password',
  'sso.complete-forgot-password' = 'sso.complete-forgot-password',
  'sso.update-profile' = 'sso.update-profile',
}

const example = {
  id: '77af2745-d972-4e1f-994a-fae8ad71d7ab',
  appData: { custom: 'data' },
  birthdate: new Date(),
  createdAt: new Date(),
  email: 'user@example.com',
  emailVerifiedAt: new Date(),
  firstname: 'Firstname',
  gender: 'm',
  lastname: 'Lastname',
  phone: '+888888888',
  phoneVerifiedAt: new Date(),
  picture: 'http://example.com/image/77af2745-d972-4e1f-994a-fae8ad71d7ab.jpg',
  revokedAt: new Date(),
  roles: 'user',
  updatedAt: new Date(),
  username: 'nickname',
  lang: 'en',
  timezone: 0,
} as SsoUserDto;

export const SSO_WEBHOOK_EVENTS: WebhookEvent[] = [
  {
    eventName: SsoWebhookEvent['sso.sign-up'],
    description: getText('An event that is triggered after a new user registers'),
    example,
  },
  {
    eventName: SsoWebhookEvent['sso.sign-in'],
    description: getText('An event that is triggered after a user login'),
    example,
  },
  {
    eventName: SsoWebhookEvent['sso.complete-sign-up'],
    description: getText('An event that is triggered after complete a new user registers'),
    example,
  },
  {
    eventName: SsoWebhookEvent['sso.sign-out'],
    description: getText('An event that is triggered after a user logout'),
    example,
  },
  {
    eventName: SsoWebhookEvent['sso.forgot-password'],
    description: getText('An event that is triggered after a user call forgot password method'),
    example,
  },
  {
    eventName: SsoWebhookEvent['sso.complete-forgot-password'],
    description: getText('An event that is triggered after a user calls to confirm a forgotten password change'),
    example,
  },
  {
    eventName: SsoWebhookEvent['sso.update-profile'],
    description: getText('An event that fires after user information is updated.'),
    example,
  },
];
