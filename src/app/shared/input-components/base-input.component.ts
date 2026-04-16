import { Component, forwardRef, Injector, Input, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgControl,
  ValidatorFn,
} from '@angular/forms';

@Component({
  selector: 'app-base-input',
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseInputComponent),
      multi: true,
    },
  ],
})
/**
 * BaseInputComponent is designed for use with Angular Reactive Forms.
 *
 * Do not use `[disabled]="true"` directly in templates.
 * Instead, always use `formControl.disable()` and `formControl.enable()`
 * to ensure consistent internal state management.
 */
export class BaseInputComponent implements ControlValueAccessor, OnInit {
  @Input() readonly = false;
  @Input() placeholder: string = 'Enter value here';
  @Input() boldTitle: boolean = false;
  @Input() title: string = 'Input';

  private ngControl?: NgControl | null;
  protected lastEmittedValue: any = '';
  protected _value: any = '';
  public isDisabled = false; // 用于 template 判断禁用状态

  constructor(private injector: Injector) {}

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl, null);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get value(): any {
    return this._value;
  }

  set value(val: any) {
    this._value = val;
  }

  get formControl(): FormControl | null {
    return this.ngControl?.control as FormControl;
  }

  get formControlName(): string | null {
    return this.ngControl && (this.ngControl as any).name ? (this.ngControl as any).name : null;
  }

  get hasError(): boolean {
    return !!(this.formControl?.invalid && this.formControl?.touched);
  }

  // ControlValueAccessor 实现
  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this._value = value ?? '';
    this.lastEmittedValue = value ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Called by Angular forms to enable or disable the component.
   *
   * Example (Reactive Forms):
   *
   * ```ts
   * this.form = this.fb.group({
   *   input: ['', [Validators.required]]
   * });
   *
   * // Disable the field
   * this.form.get('input')?.disable();
   *
   * // Enable the field
   * this.form.get('input')?.enable();
   * ```
   *
   * This method will be triggered automatically by Angular's form infrastructure
   * when you call `disable()` or `enable()` on the associated control.
   *
   * @param isDisabled - Indicates whether the component should be disabled.
   */
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  updateValidatorOfType(newValidator: ValidatorFn) {
    if (!this.formControl) {
      console.log('form control are empty');
      return;
    }

    const newName = this.getFnName(newValidator);
    const current = this.formControl.validator ? [this.formControl.validator] : [];

    const filtered = current.filter((fn) => this.getFnName(fn) !== newName);
    this.formControl.setValidators([...filtered, newValidator]);
    this.formControl.updateValueAndValidity();
  }

  protected handleInput(event: any): void {}

  protected handleBlur(): void {
    this.onTouched();
  }

  private getFnName(fn: ValidatorFn): string {
    return fn.name || fn.toString();
  }
}
