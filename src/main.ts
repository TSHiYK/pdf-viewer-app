import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_CHECK } from './app/platform-check.token';
import { PLATFORM_ID } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    {
      provide: PLATFORM_CHECK,
      useFactory: (platformId: Object) => () => isPlatformBrowser(platformId),
      deps: [PLATFORM_ID]
    }
  ]
}).catch(err => console.error(err));