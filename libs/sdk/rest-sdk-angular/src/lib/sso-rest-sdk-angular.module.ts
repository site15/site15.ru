import { NgModule } from '@angular/core';
import {
  SsoRestClientApiModule,
  SsoRestClientConfiguration,
} from './generated';

@NgModule({})
export class SsoRestSdkAngularModule {
  public static forRoot(configuration: Partial<SsoRestClientConfiguration>) {
    const ssoRestClientConfiguration = new SsoRestClientConfiguration(
      configuration
    );
    const ssoRestClientApiModule = SsoRestClientApiModule.forRoot(
      () => ssoRestClientConfiguration
    );
    return {
      ngModule: SsoRestSdkAngularModule,
      providers: [
        {
          provide: SsoRestClientConfiguration,
          useValue: ssoRestClientConfiguration,
        },
      ],
      imports: [ssoRestClientApiModule],
      exports: [ssoRestClientApiModule, SsoRestClientConfiguration],
    };
  }
}
