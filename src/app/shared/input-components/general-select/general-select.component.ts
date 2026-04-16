import { Component, EventEmitter, Input, OnInit, Output, forwardRef } from '@angular/core';
import { UntypedFormControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectInterface } from '@ionic/core/dist/types/components/select/select-interface';
import { SelectOption } from '../../statics/interface-helper';

@Component({
  selector: 'app-general-select',
  templateUrl: './general-select.component.html',
  styleUrls: ['./general-select.component.scss'],
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GeneralSelectComponent),
      multi: true,
    },
  ],
})
export class GeneralSelectComponent implements OnInit, ControlValueAccessor {
  @Input() showSelectLabel: boolean = false;
  @Input() title: string = '';
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() interface: SelectInterface = 'alert';
  @Input() multiple: boolean = false;
  @Input() okText: string = 'Apply';
  @Input() cancelText: string = 'Cancel';

  @Output() changeEvent = new EventEmitter<any>();

  input: any = null;
  value: any = null;
  isDisabled: boolean = false;

  private onChange = (_: any) => {};
  private onTouched = () => {};
  constructor() {}

  writeValue(val: any): void {
    this.value = val;
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

  onValueChange(value: any) {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  ngOnInit() {
    this.input = new UntypedFormControl('', {
      updateOn: 'change',
    });
  }

  inputChange() {
    console.log(this.input.value);
    if (this.input.valid) {
      this.changeEvent.emit(this.input.value);
    } else {
      this.changeEvent.emit(null);
    }
  }
}
