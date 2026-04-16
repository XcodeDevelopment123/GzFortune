import { Component, Input, OnInit, Injector, Optional, Host } from '@angular/core';
import { BaseInputComponent } from '../base-input.component';
import { ControlContainer, FormControl } from '@angular/forms';

@Component({
  selector: 'app-general-input',
  templateUrl: './general-input.component.html',
  styleUrls: ['./general-input.component.scss'],
  standalone: false,
})
export class GeneralInputComponent extends BaseInputComponent implements OnInit {
  @Input() inputControl?: FormControl; // 方式1：外部直接传入
  @Input() controlName?: string;

  constructor(
    injector: Injector, // ⚠️ 不要加 private/override
    @Optional() @Host() private controlContainer?: ControlContainer,
  ) {
    super(injector); // 传给父类
  }

  override ngOnInit(): void {
    if (!this.inputControl && this.controlName) {
      const parent = this.controlContainer?.control;
      this.inputControl = parent?.get(this.controlName) as FormControl;
    }
  }
}
