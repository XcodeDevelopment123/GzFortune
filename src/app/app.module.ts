import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { logHttpInterceptor } from './core/interceptors/log-interceptor.service';
import { DatePipe } from '@angular/common';
import { authHttpInterceptor } from './core/interceptors/auth-interceptor.service';
import { SharedComponentsModule } from './shared/components/shared-components.module';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    SharedComponentsModule,
    ServiceWorkerModule.register('custom-sw.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(
      withInterceptors([
        authHttpInterceptor,
        ...(environment.enableLogging ? [logHttpInterceptor] : []),
      ]),
    ),
    DatePipe, //Date library from angular
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

