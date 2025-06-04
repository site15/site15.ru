import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';

import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, TitleStrategy } from '@angular/router';
import { GithubFill } from '@ant-design/icons-angular/icons';
import { provideTransloco } from '@jsverse/transloco';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';
import { COMMON_FORMLY_FIELDS } from '@nestjs-mod/afat';
import {
  FILES_FORMLY_FIELDS,
  FilesRestSdkAngularModule,
  MINIO_URL,
} from '@nestjs-mod/files-afat';
import { SsoRestSdkAngularModule } from '@nestjs-mod/sso-rest-sdk-angular';
import { WebhookRestSdkAngularModule } from '@nestjs-mod/webhook-afat';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { serverUrl } from '../environments/environment';
import { AppInitializer } from './app-initializer';
import { AppTitleStrategy } from './app-title.strategy';
import { AppErrorHandler } from './app.error-handler';
import { appRoutes } from './app.routes';
import { provideSsoConfiguration } from './integrations/sso.configuration';
import { TranslocoHttpLoader } from './integrations/transloco-http.loader';

export const ssoAppConfig = ({
  minioURL,
}: {
  minioURL: string;
}): ApplicationConfig => {
  return {
    providers: [
      provideNzIcons([GithubFill]),
      provideClientHydration(),
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(appRoutes),
      provideHttpClient(),
      provideNzI18n(en_US),
      importProvidersFrom(
        BrowserAnimationsModule,
        SsoRestSdkAngularModule.forRoot({
          basePath: serverUrl,
        }),
        FilesRestSdkAngularModule.forRoot({
          basePath: serverUrl,
        }),
        WebhookRestSdkAngularModule.forRoot({
          basePath: serverUrl,
        }),
        FormlyModule.forRoot({
          types: [...FILES_FORMLY_FIELDS, ...COMMON_FORMLY_FIELDS],
        }),
        FormlyNgZorroAntdModule
      ),
      { provide: ErrorHandler, useClass: AppErrorHandler },
      {
        provide: MINIO_URL,
        useValue: minioURL,
      },
      provideSsoConfiguration(),
      // Transloco Config
      provideTransloco({
        config: {
          availableLangs: [
            {
              id: marker('en'),
              label: marker('app.locale.name.english'),
            },
            {
              id: marker('ru'),
              label: marker('app.locale.name.russian'),
            },
          ],
          defaultLang: 'en',
          fallbackLang: 'en',
          reRenderOnLangChange: true,
          prodMode: true,
          missingHandler: {
            logMissingKey: true,
            useFallbackTranslation: true,
            allowEmpty: true,
          },
        },
        loader: TranslocoHttpLoader,
      }),
      provideTranslocoLocale({
        defaultLocale: 'en-US',
        langToLocaleMapping: {
          en: 'en-US',
          ru: 'ru-RU',
        },
      }),
      provideTranslocoMessageformat({
        locales: ['en-US', 'ru-RU'],
      }),
      provideAppInitializer(() => {
        const initializerFn = (
          (appInitializer: AppInitializer) => () =>
            appInitializer.resolve()
        )(inject(AppInitializer));
        return initializerFn();
      }),
      {
        provide: TitleStrategy,
        useClass: AppTitleStrategy,
      },
    ],
  };
};
