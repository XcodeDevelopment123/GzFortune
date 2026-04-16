import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';

export const logHttpInterceptor: HttpInterceptorFn = (request, next) => {
  const started = Date.now();

  return next(request).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const total_time = Date.now() - started;
        console.log(`Request       : ${request.urlWithParams}`);
        console.log(`Executed time : ${total_time} ms`);
      }
    }),
  );
};
