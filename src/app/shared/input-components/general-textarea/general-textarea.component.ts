import { Component, EventEmitter, Input, OnInit, Output, forwardRef } from '@angular/core';
import { UntypedFormControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-general-textarea',
  templateUrl: './general-textarea.component.html',
  styleUrls: ['./general-textarea.component.scss'],
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GeneralTextareaComponent),
      multi: true,
    },
  ],
})
export class GeneralTextareaComponent implements OnInit, ControlValueAccessor {
  @Input() title: string = '';
  @Input() placeholder: string = 'Enter text here';
  @Input() boldClass: boolean = false;
  @Input() setValue: any;
  @Output() changeEvent = new EventEmitter<any>();

  input: any = null;
  // value!: string;

  value: string = '';
  isDisabled: boolean = false;

  onChange = (_: any) => {};
  onTouched = () => {};

  constructor() {}

  ngOnInit() {
    // this.input = new UntypedFormControl(this.setValue || '', {
    //   updateOn: 'change',
    // });
  }

  writeValue(val: string): void {
    this.value = val || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  handleChange(e: any) {
    const val = e.detail?.value ?? '';
    this.value = val;
    this.onChange(val);
    this.onTouched();
  }

  inputChange() {
    if (this.input.valid) {
      this.changeEvent.emit(this.input.value);
    } else {
      this.changeEvent.emit(null);
    }
  }
}
