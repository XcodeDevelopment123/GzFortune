import { NgModule } from '@angular/core';
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

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, SharedComponentsModule],
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
