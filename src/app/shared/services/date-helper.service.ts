import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateHelperService {
  constructor(private datePipe: DatePipe) {}

  /**
   * 使用 toLocaleString 格式化日期（适合 en-MY 本地习惯）
   * @param dateString ISO string or Date
   * @returns e.g. "06 Feb 2025, 08:30 PM"
   */
  formatLocale(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * 使用 Angular DatePipe 格式化日期（支持自定义 pattern）
   * @param dateString ISO string or Date
   * @param pattern Angular date format pattern (默认: 'd MMMM yyyy')
   * @returns e.g. "6 February 2025"
   */
  formatDate(dateString: string | Date, pattern: string = 'd MMMM yyyy'): string {
    return this.datePipe.transform(dateString, pattern, undefined, 'en-MY') || '';
  }
}
