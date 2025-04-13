import { getText } from 'nestjs-translates';
import { SsoSendNotificationOptionsOperationName } from './sso.configuration';

export const SSO_FEATURE = 'sso';
export const SSO_MODULE = 'SsoModule';
export const SSO_FOLDER = 'libs/core/sso';

export const DEFAULT_EMAIL_TEMPLATES = [
  {
    subject: getText('Verify your email'),
    text: getText('Please navigate by a {{{link}}} to verify your email'),
    html: getText(
      'Please navigate by a <a href="{{{link}}}">{{{link}}}</a> to verify your email'
    ),
    operationName: SsoSendNotificationOptionsOperationName.VERIFY_EMAIL,
  },
  {
    subject: getText('Restore forgotten password link'),
    text: getText('Please navigate by a {{{link}}} to set new password'),
    html: getText(
      'Please navigate by a <a href="{{{link}}}">{{{link}}}</a> to set new password'
    ),
    operationName:
      SsoSendNotificationOptionsOperationName.COMPLETE_FORGOT_PASSWORD,
  },
];

export const DEFAULT_EMAIL_TEMPLATE_BY_NAMES = {
  [SsoSendNotificationOptionsOperationName.VERIFY_EMAIL]:
    DEFAULT_EMAIL_TEMPLATES[0],
  [SsoSendNotificationOptionsOperationName.COMPLETE_FORGOT_PASSWORD]:
    DEFAULT_EMAIL_TEMPLATES[1],
};
