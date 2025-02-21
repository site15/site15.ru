import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { SSO_FEATURE, SSO_MODULE } from './sso.constants';
import { SsoEnvironments } from './sso.environments';
import { PrismaToolsModule } from '@nestjs-mod-sso/prisma-tools';
import { PrismaModule } from '@nestjs-mod/prisma';
import { TranslatesModule } from 'nestjs-translates';
import { SsoUsersService } from './services/sso-users.service';
import { SsoService } from './services/sso.service';
import { SsoCookieService } from './services/sso-cookie.service';
import { SsoEventsService } from './services/sso-events.service';
import { SsoMailService } from './services/sso-mail.service';
import { SsoPasswordService } from './services/sso-password.service';
import { SsoTwoFactorService } from './services/sso-two-factor.service';

export const { SsoModule } = createNestModule({
  moduleName: SSO_MODULE,
  moduleCategory: NestModuleCategory.feature,
  environmentsModel: SsoEnvironments,
  imports: [
    PrismaModule.forFeature({
      contextName: SSO_FEATURE,
      featureModuleName: SSO_FEATURE,
    }),
    PrismaToolsModule.forFeature({
      featureModuleName: SSO_FEATURE,
    }),
    TranslatesModule,
  ],
  sharedImports: [
    PrismaModule.forFeature({
      contextName: SSO_FEATURE,
      featureModuleName: SSO_FEATURE,
    }),
  ],
  sharedProviders: [
    SsoService,
    SsoUsersService,
    SsoCookieService,
    SsoEventsService,
    SsoMailService,
    SsoPasswordService,
    SsoTwoFactorService,
  ],
});
