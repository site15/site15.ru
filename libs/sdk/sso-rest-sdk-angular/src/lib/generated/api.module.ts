import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Site15RestClientConfiguration } from './configuration';
import { HttpClient } from '@angular/common/http';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: [],
})
export class Site15RestClientApiModule {
  public static forRoot(
    configurationFactory: () => Site15RestClientConfiguration,
  ): ModuleWithProviders<Site15RestClientApiModule> {
    return {
      ngModule: Site15RestClientApiModule,
      providers: [{ provide: Site15RestClientConfiguration, useFactory: configurationFactory }],
    };
  }

  constructor(@Optional() @SkipSelf() parentModule: Site15RestClientApiModule, @Optional() http: HttpClient) {
    if (parentModule) {
      throw new Error('Site15RestClientApiModule is already loaded. Import in your base AppModule only.');
    }
    if (!http) {
      throw new Error(
        'You need to import the HttpClientModule in your AppModule! \n' +
          'See also https://github.com/angular/angular/issues/20575',
      );
    }
  }
}
