import { NgModule } from '@angular/core';
import { Site15RestClientApiModule, Site15RestClientConfiguration } from './generated';

@NgModule({})
export class Site15RestSdkAngularModule {
  public static forRoot(configuration: Partial<Site15RestClientConfiguration>) {
    const site15RestClientConfiguration = new Site15RestClientConfiguration(configuration);
    const site15RestClientApiModule = Site15RestClientApiModule.forRoot(() => site15RestClientConfiguration);
    return {
      ngModule: Site15RestSdkAngularModule,
      providers: [
        {
          provide: Site15RestClientConfiguration,
          useValue: site15RestClientConfiguration,
        },
      ],
      imports: [site15RestClientApiModule],
      exports: [site15RestClientApiModule, Site15RestClientConfiguration],
    };
  }
}
