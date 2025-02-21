import { SignInArgs } from './sign-in.dto';
import { SignOutArgs } from './sign-out.dto';
import { SignUpArgs } from './sign-up.dto';

export enum SsoEventEnum {
  SignIn = 'SignIn',
  SignUp = 'SignUp',
  SignOut = 'SignOut',
}

export interface SsoEventContext {
  serviceId: string;
  userId: string;
  userIp: string;
  userAgent: string;
  [SsoEventEnum.SignIn]: {
    signInArgs: SignInArgs;
  };
  [SsoEventEnum.SignUp]: {
    signUpArgs: SignUpArgs;
  };
  [SsoEventEnum.SignOut]: {
    signOutArgs: SignOutArgs;
  };
}
