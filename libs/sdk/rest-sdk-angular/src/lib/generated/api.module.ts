import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { SsoRestClientConfiguration } from './configuration';
import { HttpClient } from '@angular/common/http';


@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: []
})
export class SsoRestClientApiModule {
    public static forRoot(configurationFactory: () => SsoRestClientConfiguration): ModuleWithProviders<SsoRestClientApiModule> {
        return {
            ngModule: SsoRestClientApiModule,
            providers: [ { provide: SsoRestClientConfiguration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: SsoRestClientApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('SsoRestClientApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
