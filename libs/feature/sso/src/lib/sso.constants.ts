import { getText } from 'nestjs-translates';
import { OperationName } from './sso.configuration';

export const SSO_FEATURE = 'sso';
export const SSO_MODULE = 'SsoModule';
export const SSO_FOLDER = 'libs/feature/sso';
export const X_SKIP_THROTTLE = 'x-skip-throttle';

export const DEFAULT_EMAIL_TEMPLATES = [
  {
    subject: getText('Verify your email'),
    text: getText('Please navigate by a {{{link}}} to verify your email'),
    html: getText(
      'Please navigate by a <a href="{{{link}}}">{{{link}}}</a> to verify your email'
    ),
    operationName: OperationName.VERIFY_EMAIL,
  },
  {
    subject: getText('Restore forgotten password link'),
    text: getText('Please navigate by a {{{link}}} to set new password'),
    html: getText(
      'Please navigate by a <a href="{{{link}}}">{{{link}}}</a> to set new password'
    ),
    operationName: OperationName.COMPLETE_FORGOT_PASSWORD,
  },
  {
    subject: getText('Complete your registration using the invitation link'),
    text: getText(
      'Please navigate by a {{{link}}} to complete your registration'
    ),
    html: getText(
      'Please navigate by a <a href="{{{link}}}">{{{link}}}</a> to complete your registration'
    ),
    operationName:
      OperationName.COMPLETE_REGISTRATION_USING_THE_INVITATION_LINK,
  },
];

export const DEFAULT_EMAIL_TEMPLATE_BY_NAMES = {
  [OperationName.VERIFY_EMAIL]: DEFAULT_EMAIL_TEMPLATES[0],
  [OperationName.COMPLETE_FORGOT_PASSWORD]: DEFAULT_EMAIL_TEMPLATES[1],
  [OperationName.COMPLETE_REGISTRATION_USING_THE_INVITATION_LINK]:
    DEFAULT_EMAIL_TEMPLATES[2],
};
