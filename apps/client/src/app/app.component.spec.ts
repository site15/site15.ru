import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';
import { FilesRestSdkAngularModule, MINIO_URL } from '@nestjs-mod/files-afat';
import { Site15RestSdkAngularModule } from '@site15/rest-sdk-angular';
import { WebhookRestSdkAngularModule } from '@nestjs-mod/webhook-afat';
import { minioURL, serverUrl } from '../environments/environment';
import { AppComponent } from './app.component';
import { APP_TITLE } from './app.constants';
import { provideSsoConfiguration } from './integrations/sso.configuration';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        // Transloco Config
        provideTransloco({
          config: {
            availableLangs: [
              {
                id: 'en',
                label: 'app.locale.name.english',
              },
              {
                id: 'ru',
                label: 'app.locale.name.russian',
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
        {
          provide: MINIO_URL,
          useValue: minioURL,
        },
        provideSsoConfiguration(),
      ],
      imports: [
        AppComponent,
        RouterModule.forRoot([]),
        HttpClientModule,
        Site15RestSdkAngularModule.forRoot({
          basePath: serverUrl,
        }),
        FilesRestSdkAngularModule.forRoot({
          basePath: serverUrl,
        }),
        WebhookRestSdkAngularModule.forRoot({
          basePath: serverUrl,
        }),
      ],
    }).compileComponents();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.logo')?.textContent).toContain(APP_TITLE);
  });

  it(`should have as title 'Site15'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual(APP_TITLE);
  });
});
