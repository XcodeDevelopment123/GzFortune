import { Component, Injector, forwardRef } from '@angular/core';
import { AbstractControl, ValidationErrors, NG_VALIDATORS, Validator } from '@angular/forms';
import { BaseInputComponent } from '../base-input.component';

type Part = 'dd' | 'mm' | 'yyyy';

@Component({
  selector: 'app-general-date-input',
  templateUrl: './general-date-input.component.html',
  styleUrls: ['./general-date-input.component.scss'],
  standalone: false,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GeneralDateInputComponent),
      multi: true,
    },
  ],
})
export class GeneralDateInputComponent extends BaseInputComponent implements Validator {
  dd = '';
  mm = '';
  yyyy = '';

  private readonly minYear = 1900;
  private readonly maxYear = new Date().getFullYear();

  // ✅ popover 控制
  openPart: Part | null = null;
  popoverEvent: any = null;

  // ✅ options
  get dayOptions(): string[] {
    const y = this.getEffectiveYearForDays();
    const m = this.mm ? Number(this.mm) : 1;
    const maxD = this.daysInMonth(y, m);
    return Array.from({ length: maxD }, (_, i) => String(i + 1).padStart(2, '0'));
  }

  get hasAnyValue(): boolean {
    return !!(this.dd || this.mm || this.yyyy);
  }

  readonly monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  readonly yearOptions = Array.from(
    { length: this.maxYear - this.minYear + 1 },
    (_, i) => String(this.maxYear - i), // 最新年在最上面
  );

  constructor(injector: Injector) {
    super(injector);
  }

  clearDate(ev?: Event) {
    ev?.preventDefault?.();
    ev?.stopPropagation?.();

    this.dd = '';
    this.mm = '';
    this.yyyy = '';

    this.closeList(); // 如果 popover 开着先关掉

    this.value = '';
    this.onChange(this.value);
    this.onTouched();

    const ctrl: any = (this as any).ngControl?.control;
    ctrl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  override writeValue(val: any): void {
    super.writeValue(val);
    const ymd = (val ?? '').toString().trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
      this.dd = this.mm = this.yyyy = '';
      return;
    }
    const [yyyy, mm, dd] = ymd.split('-');
    this.dd = dd;
    this.mm = mm;
    this.yyyy = yyyy;
  }

  validate(_: AbstractControl): ValidationErrors | null {
    const anyFilled = !!(this.dd || this.mm || this.yyyy);
    if (!anyFilled) return null;

    if (this.dd.length !== 2 || this.mm.length !== 2 || this.yyyy.length !== 4) {
      return { invalidDate: true };
    }

    const ymd = `${this.yyyy}-${this.mm}-${this.dd}`;
    return this.isValidYmd(ymd) ? null : { invalidDate: true };
  }

  // ========== Popover 打开/关闭 ==========
  openList(part: Part, ev: Event) {
    if (this.isDisabled) return;
    ev.preventDefault();
    ev.stopPropagation();
    (document.activeElement as HTMLElement | null)?.blur?.();

    // ✅ 打开 day list 前，确保 dd 不超过当月最大天数
    if (part === 'dd' && this.dd && this.mm && this.yyyy) {
      this.clampDayIfNeeded();
    }

    this.openPart = part;
    this.popoverEvent = ev;
  }

  closeList() {
    this.openPart = null;
    this.popoverEvent = null;
  }

  // ========== 选择值 ==========
  selectDay(dd: string) {
    this.dd = dd;
    this.clampDayIfNeeded();
    this.emitModelAndValidate();
    this.closeList();
  }

  selectMonth(mm: string) {
    this.mm = mm;
    if (!this.dd) this.dd = '01';
    this.clampDayIfNeeded();
    this.emitModelAndValidate();
    this.closeList();
  }

  selectYear(yyyy: string) {
    this.yyyy = yyyy;
    if (!this.dd) this.dd = '01';
    this.clampDayIfNeeded();
    this.emitModelAndValidate();
    this.closeList();
  }

  private clampDayIfNeeded() {
    // 只要 mm + dd 有值就可以夹（yyyy 可能为空）
    if (this.mm.length !== 2 || this.dd.length !== 2) return;

    const m = Number(this.mm);
    const d = Number(this.dd);

    // 年还没选：2月允许 29；其他月照常 30/31
    if (!this.yyyy) {
      const maxD = m === 2 ? 29 : this.daysInMonth(2024, m);
      this.dd = String(Math.min(d, maxD)).padStart(2, '0');
      return;
    }

    // 年已选：严格按该年该月
    const y = Number(this.yyyy);
    const maxD = this.daysInMonth(y, m);
    this.dd = String(Math.min(d, maxD)).padStart(2, '0');
  }

  onAnyBlur() {
    this.onTouched();
    const ctrl: any = (this as any).ngControl?.control;
    ctrl?.markAsTouched();
    ctrl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  get ctrl(): any {
    return (this as any).ngControl?.control;
  }
  get hasInvalidDate(): boolean {
    return !!this.ctrl?.errors?.invalidDate;
  }
  get touchedForUi(): boolean {
    return !!this.ctrl?.touched;
  }

  private emitModelAndValidate() {
    const complete = this.dd.length === 2 && this.mm.length === 2 && this.yyyy.length === 4;
    const ymd = complete ? `${this.yyyy}-${this.mm}-${this.dd}` : '';
    this.value = ymd;
    this.onChange(this.value);
    this.onTouched();

    const ctrl: any = (this as any).ngControl?.control;
    ctrl?.markAsTouched();
    ctrl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  private isValidYmd(val: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
    const [yStr, mStr, dStr] = val.split('-');
    const y = Number(yStr),
      m = Number(mStr),
      d = Number(dStr);
    if (m < 1 || m > 12) return false;
    const maxDay = this.daysInMonth(y, m);
    return d >= 1 && d <= maxDay;
  }

  private daysInMonth(year: number, month: number): number {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const md = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return md[month - 1];
  }

  private getEffectiveYearForDays(): number {
    // 如果用户还没选 year：为了让 2 月可以先选到 29，默认用闰年（例如 2024）
    if (!this.yyyy) return 2024;

    const y = Number(this.yyyy);
    return Number.isFinite(y) ? y : 2024;
  }
}
