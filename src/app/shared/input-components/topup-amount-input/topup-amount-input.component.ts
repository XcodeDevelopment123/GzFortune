import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-topup-amount-input',
  templateUrl: './topup-amount-input.component.html',
  styleUrls: ['./topup-amount-input.component.scss'],
  standalone: false,
})
export class TopupAmountInputComponent implements OnInit, OnChanges {
  amount: string = '';
  @Input() setValue: number = 0;

  @Output() changeEvent = new EventEmitter<any>();

  input: any = null;

  constructor() {}

  ngOnInit() {
    this.input = new UntypedFormControl(this.setValue, {
      updateOn: 'change',
      validators: [Validators.minLength(0), Validators.maxLength(6), Validators.max(200)],
    });
  }

  onKeyPress(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    // 只允许数字 0-9
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  inputTyping(event: CustomEvent) {
    let value = ((event.target as HTMLIonInputElement).value as string) ?? '';

    // 只保留数字
    value = value.replace(/[^\d]/g, '');

    if (value === '') {
      this.amount = '';
      this.changeEvent.emit(0); // 发送 0 而不是 null
      return;
    }

    if (value.length === 1) {
      this.amount = `0.0${value}`;
    } else if (value.length === 2) {
      this.amount = `0.${value}`;
    } else if (value.length > 2) {
      let integerPart = value.slice(0, value.length - 2);
      let decimalPart = value.slice(value.length - 2);
      integerPart = integerPart.replace(/^0+/, '');
      if (integerPart === '') {
        integerPart = '0';
      }

      let formatted = parseFloat(`${integerPart}.${decimalPart}`);

      if (isNaN(formatted)) {
        formatted = 0;
      } else if (formatted > 200) {
        formatted = 200;
      }

      this.amount = `${formatted.toFixed(2)}`;
    }

    // 更新输入框的值
    (event.target as HTMLIonInputElement).value = this.amount;

    // 发送数字值
    const numericAmount = parseFloat(this.amount);
    this.changeEvent.emit(isNaN(numericAmount) ? 0 : numericAmount);
  }

  inputChange() {
    // inputTyping 已经处理了 emit，这里可以保留或移除
    const numericAmount = parseFloat(this.amount);
    this.changeEvent.emit(isNaN(numericAmount) ? 0 : numericAmount);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['setValue'] && !changes['setValue'].firstChange && this.setValue > 0) {
      const value = parseFloat(this.setValue.toString());

      let formattedValue = value.toString();

      if (value % 1 === 0) {
        formattedValue = `${value}.00`;
      } else {
        formattedValue = value.toFixed(2);
      }

      this.input.setValue(formattedValue, { emitEvent: false });

      // 同时更新 amount 显示
      this.amount = formattedValue;
    }
  }
}
