import { SignInArgs } from './sign-in.dto';
import { SignOutArgs } from './sign-out.dto';
import { SignUpArgs } from './sign-up.dto';

export enum SsoEventEnum {
  SignIn = 'SignIn',
  SignUp = 'SignUp',
  SignOut = 'SignOut',
}

export interface SsoEventContext {
  [SsoEventEnum.SignIn]: {
    signInArgs: SignInArgs;
  };
  [SsoEventEnum.SignUp]: {
    signUpArgs: SignUpArgs;
  };
  [SsoEventEnum.SignOut]: {
    signOutArgs: SignOutArgs;
  };
  serviceId: string;
  userId: string;
  projectId: string;
  userIp: string;
  userAgent: string;
}
