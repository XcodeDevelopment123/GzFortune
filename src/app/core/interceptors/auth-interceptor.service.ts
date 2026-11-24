import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

import { NavController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { AuthApiService } from '../repo/api/auth-api.service';
import { environment } from 'src/environments/environment';

export const authHttpInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<HttpEvent<any>> => {
  const navCtrl = inject(NavController);
  const authService = inject(AuthService);
  const authApiService = inject(AuthApiService);

  const addBaseHeader = (req: HttpRequest<any>) =>
    req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

  // Member session goes only to our own backend, never to third-party hosts.
  const isOwnApi = request.url.startsWith(environment.apiUrl);

  return from(
    Promise.all([
      authService.getAccessToken(),
      isOwnApi ? authService.getMemberSession() : Promise.resolve(null),
    ]),
  ).pipe(
    switchMap(([accessToken, memberSession]) => {
      let req = addBaseHeader(request);
      if (memberSession) {
        req = req.clone({ setHeaders: { 'X-Member-Session': memberSession } });
      }
      if (accessToken) {
        req = req.clone({
          setHeaders: {
            ...req.headers
              .keys()
              .reduce((acc, key) => ({ ...acc, [key]: req.headers.get(key) }), {}),
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
      return next(req).pipe(
        catchError((err: any) => {
          // Member session missing/expired: the page asks the member to sign in again.
          // Refreshing the app token cannot fix it, so do not retry or force-navigate.
          if (err.status === 401 && err.error?.code === 'member_session_required') {
            return throwError(() => err);
          }
          // 仅针对 401 进行尝试 refresh
          if (err.status === 401) {
            // 这里调用 refresh 方法
            return from(authApiService.getAccessToken()).pipe(
              switchMap((newToken) => {
                if (newToken) {
                  // 重新克隆请求，加上新 token
                  const retryReq = req.clone({
                    setHeaders: {
                      ...req.headers
                        .keys()
                        .reduce((acc, key) => ({ ...acc, [key]: req.headers.get(key) }), {}),
                      Authorization: `Bearer ${newToken}`,
                    },
                  });
                  return next(retryReq);
                } else {
                  navCtrl.navigateRoot('/login');
                  return throwError(() => err);
                }
              }),
              catchError(() => {
                navCtrl.navigateRoot('/login');
                return throwError(() => err);
              }),
            );
          }
          return throwError(() => err);
        }),
      );
    }),
  );
};
