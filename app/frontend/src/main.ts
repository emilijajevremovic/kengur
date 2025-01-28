/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { HttpClientModule, withInterceptors } from "@angular/common/http";
import { enableProdMode, importProvidersFrom } from "@angular/core";
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from "@angular/common/http";
import { authInterceptor } from './app/guards/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
      provideRouter(routes),
      provideHttpClient(withInterceptors([authInterceptor]))
  ]
}).catch((err) =>
  console.error(err)
);
