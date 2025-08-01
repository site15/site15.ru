/* !!! This is code generated by Prisma. Do not edit directly. !!! */
/* eslint-disable */
// @ts-nocheck
/**
 * This file should be your main import to use Prisma. Through it you get access to all the models, enums, and input types.
 *
 * 🟢 You can import this file directly.
 */

import * as process from 'node:process';
import * as path from 'node:path';

import * as runtime from '@prisma/client/runtime/client';
import * as $Enums from './enums';
import * as $Class from './internal/class';
import * as Prisma from './internal/prismaNamespace';

export * as $Enums from './enums';
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more SsoUsers
 * const ssoUsers = await prisma.ssoUser.findMany()
 * ```
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export const PrismaClient = $Class.getPrismaClientClass(__dirname);
export type PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  Log = $Class.LogOptions<ClientOptions>,
  ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs,
> = $Class.PrismaClient<ClientOptions, Log, ExtArgs>;
export { Prisma };

/**
 * Model SsoUser
 *
 */
export type SsoUser = Prisma.SsoUserModel;
/**
 * Model migrations_sso
 *
 */
export type migrations_sso = Prisma.migrations_ssoModel;
/**
 * Model SsoRefreshSession
 *
 */
export type SsoRefreshSession = Prisma.SsoRefreshSessionModel;
/**
 * Model SsoEmailTemplate
 *
 */
export type SsoEmailTemplate = Prisma.SsoEmailTemplateModel;
/**
 * Model SsoOAuthProvider
 *
 */
export type SsoOAuthProvider = Prisma.SsoOAuthProviderModel;
/**
 * Model SsoOAuthProviderSettings
 *
 */
export type SsoOAuthProviderSettings = Prisma.SsoOAuthProviderSettingsModel;
/**
 * Model SsoOAuthToken
 *
 */
export type SsoOAuthToken = Prisma.SsoOAuthTokenModel;
/**
 * Model SsoTenant
 *
 */
export type SsoTenant = Prisma.SsoTenantModel;
