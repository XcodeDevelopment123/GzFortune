import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  private http = inject(HttpClient);

  private buildUrl(path: string): string {
    return `${environment.apiUrl}${path}`;
  }

  private formatErrors(error: HttpErrorResponse) {
    return throwError(() => ({
      status: error.status,
      message: error.message,
      error: error.error,
    }));
  }

  get<T>(
    path: string,
    options: {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      params?:
        | HttpParams
        | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
    } = {},
  ): Observable<T> {
    return this.http.get<T>(this.buildUrl(path), options).pipe(catchError(this.formatErrors));
  }

  post<T>(path: string, body: any = {}, options: object = {}): Observable<T> {
    return this.http
      .post<T>(this.buildUrl(path), body, options)
      .pipe(catchError(this.formatErrors));
  }

  put<T>(path: string, body: any = {}, options: object = {}): Observable<T> {
    return this.http.put<T>(this.buildUrl(path), body, options).pipe(catchError(this.formatErrors));
  }

  delete<T>(path: string, options: object = {}): Observable<T> {
    return this.http.delete<T>(this.buildUrl(path), options).pipe(catchError(this.formatErrors));
  }

  patch<T>(path: string, body: any = {}, options: object = {}): Observable<T> {
    return this.http
      .patch<T>(this.buildUrl(path), body, options)
      .pipe(catchError(this.formatErrors));
  }
}
