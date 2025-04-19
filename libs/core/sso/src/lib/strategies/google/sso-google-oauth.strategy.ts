import { PrismaToolsService } from '@nestjs-mod-sso/prisma-tools';
import { isInfrastructureMode } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  PrismaClient,
  SsoOAuthProvider,
  SsoOAuthProviderSettings,
  SsoOAuthToken,
} from '@prisma/sso-client';
import { Request } from 'express';
import { render } from 'mustache';
import { randomUUID } from 'node:crypto';
import passport from 'passport';
import {
  GoogleCallbackParameters,
  Profile,
  Strategy,
  VerifyCallback,
} from 'passport-google-oauth20';
import { from, lastValueFrom, Observable, of, throwError } from 'rxjs';
import { catchError, map, mapTo, mergeMap, tap } from 'rxjs/operators';
import { SsoService } from '../../services/sso.service';
import { SSO_FEATURE } from '../../sso.constants';
import { SsoRequest } from '../../types/sso-request';

// https://console.cloud.google.com/apis/credentials
// https://myaccount.google.com/permissions
// http://localhost:3000/api/sso/oauth/google?redirect_uri=http://localhost:3000/api/sso/oauth/google/redirect
// http://localhost:3000/api/sso/oauth/google/redirect?code=4%2F0Ab_5qll33vhPfgSQAQbXP96Vo_i0zh2IIogkSQTD3mZxbBDv8HQP0qJAvUJfdU_5RbVW2g&scope=email+profile+openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&authuser=0&prompt=none
// http://localhost:3000/?verificationCode=3a8b11c4-f91e-42fd-912c-286b6122e2c6
@Injectable()
export class SsoGoogleOAuthStrategy implements OnModuleInit {
  static oauthProviderName = 'google';
  readonly oauthProviderName = 'google';

  private logger = new Logger(SsoGoogleOAuthStrategy.name);

  private readonly clientIDKey = 'GOOGLE_OAUTH_CLIENT_ID';
  private readonly clientSecretKey = 'GOOGLE_OAUTH_CLIENT_SECRET_KEY';

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly ssoService: SsoService
  ) {}

  public getProvider(): Observable<
    | (SsoOAuthProvider & {
        SsoOAuthProviderSettings: SsoOAuthProviderSettings[];
      })
    | null
  > {
    return from(
      this.prismaClient.ssoOAuthProvider.findFirstOrThrow({
        where: { name: this.oauthProviderName },
        include: { SsoOAuthProviderSettings: true },
      })
    ).pipe(
      catchError((err) => {
        if (this.prismaToolsService.isErrorOfRecordNotFound(err)) {
          return from(
            this.prismaClient.ssoOAuthProvider.create({
              include: { SsoOAuthProviderSettings: true },
              data: {
                name: this.oauthProviderName,
                SsoOAuthProviderSettings: {
                  create: [
                    {
                      name: this.clientIDKey,
                      value: '',
                    },
                    {
                      name: this.clientSecretKey,
                      value: '',
                    },
                  ],
                },
              },
            })
          ).pipe(
            catchError((err) => {
              if (
                this.prismaToolsService.isErrorOfUniqueField<SsoOAuthProvider>(
                  err,
                  'name',
                  true
                )
              ) {
                return of(null);
              }
              this.logger.error(err, err.stack);
              return throwError(() => err);
            })
          );
        }
        this.logger.error(err, err.stack);
        return throwError(() => err);
      })
    );
  }

  async onModuleInit() {
    this.logger.debug('onModuleInit');

    if (isInfrastructureMode()) {
      return;
    }

    await lastValueFrom(
      this.getProviderOptions().pipe(
        tap(
          (options: {
            providerId: string;
            clientID: string;
            clientSecret: string;
            callbackURL: string;
            scope: string[];
          }) =>
            passport.use(
              this.oauthProviderName,
              new Strategy(
                { ...options, passReqToCallback: true },
                (
                  req: Request,
                  accessToken: string,
                  refreshToken: string,
                  params: GoogleCallbackParameters,
                  profile: Profile,
                  done: VerifyCallback
                ) => {
                  const projectId = (req as unknown as SsoRequest).ssoProject
                    ?.id;
                  const verificationCode = randomUUID();
                  this.logger.debug(
                    JSON.stringify({ projectId, profile, verificationCode })
                  );
                  if (!profile.id) {
                    done(null, undefined);
                    return;
                  }
                  from(
                    this.prismaClient.ssoOAuthToken.findFirstOrThrow({
                      include: {
                        SsoUser: {
                          select: {
                            picture: true,
                            firstname: true,
                            lastname: true,
                          },
                        },
                      },
                      where: {
                        providerUserId: String(profile.id),
                        providerId: options.providerId,
                      },
                    })
                  )
                    .pipe(
                      mergeMap((oAuthToken) =>
                        from(
                          this.prismaClient.ssoUser.update({
                            where: {
                              id: oAuthToken.userId,
                            },
                            data: {
                              picture:
                                oAuthToken.SsoUser.picture ||
                                (profile.photos &&
                                  profile.photos.length &&
                                  profile.photos[0].value) ||
                                null,
                              firstname:
                                oAuthToken.SsoUser.firstname ||
                                profile.name?.givenName ||
                                null,
                              lastname:
                                oAuthToken.SsoUser.lastname ||
                                profile.name?.familyName ||
                                null,
                            },
                          })
                        ).pipe(map(() => oAuthToken))
                      ),
                      mergeMap((oAuthToken: SsoOAuthToken) =>
                        from(
                          this.prismaClient.ssoOAuthToken.update({
                            where: {
                              id: oAuthToken.id,
                            },
                            data: {
                              accessToken,
                              refreshToken,
                              verificationCode,
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              providerUserData: profile as any,
                            },
                          })
                        )
                      ),
                      catchError((err) => {
                        if (
                          this.prismaToolsService.isErrorOfRecordNotFound(err)
                        ) {
                          const username =
                            (profile.displayName &&
                              profile.displayName
                                .split(' ')
                                .join('_')
                                .toLowerCase()) ||
                            `${this.oauthProviderName}_${profile.id}`;
                          const email =
                            (profile.emails &&
                              profile.emails.length &&
                              profile.emails[0]?.value) ||
                            `${this.oauthProviderName}_${profile.id}`;

                          const password = `${this.oauthProviderName}_${profile.id}`;

                          return from(
                            this.prismaClient.ssoUser.findFirstOrThrow({
                              where: { email, projectId },
                            })
                          ).pipe(
                            catchError((err) => {
                              if (
                                this.prismaToolsService.isErrorOfRecordNotFound(
                                  err
                                )
                              ) {
                                return this.ssoService.autoSignUp({
                                  projectId,
                                  email,
                                  password,
                                  username,
                                  picture:
                                    (profile.photos &&
                                      profile.photos.length &&
                                      profile.photos[0].value) ||
                                    undefined,
                                  firstname:
                                    profile.name?.givenName || undefined,
                                  lastname:
                                    profile.name?.familyName || undefined,
                                });
                              }
                              this.logger.error(err, err.stack);
                              return throwError(() => err);
                            }),
                            mergeMap((user) => {
                              console.log({
                                accessToken,
                                refreshToken,
                                providerUserId: String(profile.id),
                                providerId: options.providerId,
                                projectId,
                                userId: user.id,
                                verificationCode,
                              });
                              return from(
                                this.prismaClient.ssoOAuthToken.create({
                                  data: {
                                    accessToken,
                                    refreshToken,
                                    providerUserId: String(profile.id),
                                    providerId: options.providerId,
                                    projectId,
                                    userId: user.id,
                                    verificationCode,
                                  },
                                })
                              );
                            })
                          );
                        }
                        this.logger.error(err, err.stack);
                        return throwError(() => err);
                      }),
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      tap((user) => done(null, { ...user, verificationCode }!)),
                      catchError((err) => {
                        done(err, undefined);
                        return of(null);
                      })
                    )
                    .subscribe();
                }
              )
            )
        ),
        mapTo(true)
      )
    );
  }

  public getProviderOptions(): Observable<{
    providerId: string;
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope: string[];
  }> {
    const domain = 'https://sso.nestjs-mod.com';
    const redirectUrl = '{{{domain}}}/api/sso/oauth/{{providerName}}/redirect';
    return this.getProvider().pipe(
      map((provider) => {
        const context = {
          providerName: provider?.name,
          domain,
        };
        try {
          const callbackURL = render(redirectUrl, context);
          if (!provider) {
            throw Error(`provider not set`);
          }
          const ssoOAuthProviderSettings =
            provider.SsoOAuthProviderSettings || [];
          return {
            providerId: provider.id,
            clientID:
              ssoOAuthProviderSettings.find((s) => s.name === this.clientIDKey)
                ?.value || '',
            clientSecret:
              ssoOAuthProviderSettings.find(
                (s) => s.name === this.clientSecretKey
              )?.value || '',
            callbackURL,
            scope: ['email', 'profile'],
          };
        } catch (error) {
          throw Error(
            `Error in render callbackURL from template: "${redirectUrl}",  context: "${context}"`
          );
        }
      })
    );
  }
}
