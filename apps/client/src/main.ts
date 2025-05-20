import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { minioURL } from './environments/environment';
import { ssoAppConfig } from './app/app.config';

bootstrapApplication(AppComponent, ssoAppConfig({ minioURL })).catch((err) =>
  console.error(err)
);
