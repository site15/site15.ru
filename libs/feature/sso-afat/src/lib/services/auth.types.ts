export interface SsoTokens {
  access_token?: string;
  refresh_token?: string;
}

export interface SsoUser {
  id: string;
  email: string;
  preferredUsername: string;
  givenName?: string | null;
  familyName?: string | null;
  middleName?: string | null;
  nickname?: string | null;
  picture?: string | null;
  gender?: string | null;
  birthdate?: string | null;
  phoneNumber?: string | null;
  roles?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appData?: Record<string, any>;
  lang?: string | null;
  timezone?: number | null;
}

export interface SsoLoginInput {
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface SsoSignupInput {
  email?: string;
  password: string;
  confirmPassword: string;
  givenName?: string;
  familyName?: string;
  middleName?: string;
  nickname?: string;
  picture?: string;
  gender?: string;
  birthdate?: string;
  phoneNumber?: string;
  roles?: string[];
  redirectUri?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appData?: Record<string, any>;
}

export interface SsoUserAndTokens {
  tokens?: SsoTokens;
  user?: SsoUser;
}

export interface SsoUpdateProfileInput {
  oldPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  middleName?: string;
  nickname?: string;
  gender?: string;
  birthdate?: string;
  phoneNumber?: string;
  picture?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appData?: Record<string, any>;
  lang?: string;
  timezone?: number;
}

export interface SsoCompleteSignUpInput {
  code: string;
}

export interface SsoForgotPasswordInput {
  email: string;
  redirectUri?: string;
}

export interface SsoCompleteForgotPasswordInput {
  code: string;
  password: string;
  confirmPassword: string;
}

export type OAuthProvider = {
  name: string;
  url: string;
};

export interface OAuthVerificationInput {
  verificationCode: string;
  clientId: string | undefined;
}
