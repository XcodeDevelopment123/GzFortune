# Base Input Component 使用指南 / Base Input Component Usage Guide

## 概述 / Overview

本指南介绍如何使用 Base Input Component 系统来创建自定义输入组件和表单验证。这个系统提供了统一的基础类，简化了 Ionic Angular 项目中的表单组件开发。

This guide explains how to use the Base Input Component system to create custom input components and form validation. This system provides a unified base class that simplifies form component development in Ionic Angular projects.

---

## 第一部分：创建新的输入组件 / Part 1: Creating New Input Components

### 1.1 基本创建方法 / Basic Creation Method

要创建新的输入组件，只需要继承 `BaseInputComponent`：

To create a new input component, simply extend `BaseInputComponent`:

```typescript
// text-input.component.ts
@Component({
  selector: 'app-text-input',
  template: `
    <ion-item [disabled]="disabled">
      <ion-label position="floating" *ngIf="label">{{ label }}</ion-label>
      <ion-input
        type="text"
        [placeholder]="placeholder"
        [value]="value"
        [disabled]="disabled"
        [readonly]="readonly"
        (ionInput)="onInput($event)"
        (ionBlur)="onBlur()">
      </ion-input>
    </ion-item>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true,
    },
  ],
})
export class TextInputComponent extends BaseInputComponent {
  onInput(event: any): void {
    this.handleInput(event);
  }

  onBlur(): void {
    this.handleBlur();
  }
}
```

### 1.2 默认功能 / Default Features

继承 `BaseInputComponent` 后，你的组件自动拥有以下功能：

After extending `BaseInputComponent`, your component automatically has these features:

- ✅ **disabled** - 禁用状态 / Disabled state
- ✅ **readonly** - 只读状态 / Readonly state
- ✅ **label** - 标签文本 / Label text
- ✅ **placeholder** - 占位符 / Placeholder
- ✅ **FormControl 集成** - 表单控制器集成 / FormControl integration
- ✅ **ControlValueAccessor** - 双向绑定支持 / Two-way binding support

### 1.3 在模板中使用默认属性 / Using Default Properties in Template

直接在你的 `ion-input` 中设置这些属性：

Directly set these properties in your `ion-input`:

```html
<ion-input
  [placeholder]="placeholder"
  [value]="value"
  [disabled]="disabled"
  [readonly]="readonly"
  (ionInput)="onInput($event)"
  (ionBlur)="onBlur()">
</ion-input>
```

---

## 第二部分：自定义错误验证 / Part 2: Custom Error Validation

### 2.1 创建自定义验证器 / Creating Custom Validators

在 `shared/utils/validators.ts` 中创建验证器：

Create validators in `shared/utils/validators.ts`:

```typescript
// shared/utils/validators.ts
import { AbstractControl, ValidatorFn } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null;

    const value = control.value;
    const requirements = {
      hasUppercase: /[A-Z]/.test(value),
      hasLowercase: /[a-z]/.test(value),
      hasNumber: /\d/.test(value),
      hasSpecialChar: /[@$!%*?&]/.test(value),
      hasMinLength: value.length >= 8,
    };

    const isValid = Object.values(requirements).every(Boolean);

    return isValid ? null : { passwordStrength: requirements };
  };
}

export function emailDomainValidator(allowedDomains: string[]): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null;

    const email = control.value;
    const domain = email.split('@')[1];

    return allowedDomains.includes(domain)
      ? null
      : { emailDomain: { allowedDomains, currentDomain: domain } };
  };
}
```

### 2.2 在组件中实现错误检查 / Implementing Error Checking in Components

```typescript
// password-input.component.ts
export class PasswordInputComponent extends BaseInputComponent {
  @Input() showStrengthIndicator = false;
  showPassword = false;

  // 检查特定验证条件 / Check specific validation conditions
  check(type: string): boolean {
    return this.formControl?.errors?.['passwordStrength']?.[type] ?? false;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onInput(event: any): void {
    this.handleInput(event);
  }

  onBlur(): void {
    this.handleBlur();
  }
}
```

### 2.3 在模板中显示错误信息 / Displaying Error Messages in Template

```html
<!-- password-input.component.html -->
<ion-item [disabled]="disabled">
  <ion-label position="floating" *ngIf="label">{{ label }}</ion-label>
  <ion-input
    [type]="showPassword ? 'text' : 'password'"
    [placeholder]="placeholder"
    [value]="value"
    [disabled]="disabled"
    [readonly]="readonly"
    (ionInput)="onInput($event)"
    (ionBlur)="onBlur()">
  </ion-input>
  <ion-button slot="end" fill="clear" size="small" (click)="togglePassword()">
    <ion-icon [name]="showPassword ? 'eye-off' : 'eye'"></ion-icon>
  </ion-button>
</ion-item>

<!-- 自定义错误提示 / Custom Error Messages -->
<ng-container
  *ngIf="!formControl?.errors?.['required'] && formControl.errors?.['passwordStrength']">
  <ion-text color="danger">
    <ion-icon name="alert-circle-outline"></ion-icon>
    <small>Password must contain: / 密码必须包含：</small>
  </ion-text>
  <ul class="text-sm">
    <li [style.color]="check('hasLowercase') ? 'green' : 'red'">
      ✔ At least one lowercase letter / 至少一个小写字母
    </li>
    <li [style.color]="check('hasUppercase') ? 'green' : 'red'">
      ✔ At least one uppercase letter / 至少一个大写字母
    </li>
    <li [style.color]="check('hasNumber') ? 'green' : 'red'">
      ✔ At least one number / 至少一个数字
    </li>
    <li [style.color]="check('hasSpecialChar') ? 'green' : 'red'">
      ✔ At least one special character (@ $ ! % * ? &) / 至少一个特殊字符
    </li>
    <li [style.color]="check('hasMinLength') ? 'green' : 'red'">
      ✔ Minimum 8 characters / 最少8个字符
    </li>
  </ul>
</ng-container>
```

---

## 第三部分：在父组件中使用 / Part 3: Using in Parent Components

### 3.1 创建表单 / Creating Forms

```typescript
// login.page.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { passwordValidator } from '../shared/utils/validators';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  form?: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordValidator()]],
    });
  }

  login() {
    if (this.form?.valid) {
      console.log('Form values:', this.form.value);
      // 处理登录逻辑 / Handle login logic
    }
  }
}
```

### 3.2 在模板中使用组件 / Using Components in Template

```html
<!-- login.page.html -->
<form *ngIf="form" [formGroup]="form" (ngSubmit)="login()">
  <app-email-input
    formControlName="email"
    label="Email Address / 邮箱地址"
    placeholder="Enter your email / 请输入邮箱">
  </app-email-input>

  <app-password-input
    formControlName="password"
    label="Password / 密码"
    placeholder="Enter your password / 请输入密码"
    [showStrengthIndicator]="true">
  </app-password-input>

  <ion-button type="submit" expand="block" [disabled]="form.invalid"> Login / 登录 </ion-button>
</form>
```

---

## 第四部分：完整示例 / Part 4: Complete Examples

### 4.1 邮箱输入组件 / Email Input Component

```typescript
// email-input.component.ts
@Component({
  selector: 'app-email-input',
  template: `
    <ion-item [disabled]="disabled">
      <ion-label position="floating" *ngIf="label">{{ label }}</ion-label>
      <ion-input
        type="email"
        [placeholder]="placeholder"
        [value]="value"
        [disabled]="disabled"
        [readonly]="readonly"
        (ionInput)="onInput($event)"
        (ionBlur)="onBlur()">
      </ion-input>
      <ion-icon name="mail-outline" slot="end" color="medium"></ion-icon>
    </ion-item>

    <!-- 错误提示 / Error Messages -->
    <ion-text color="danger" *ngIf="hasError">
      <small>{{ errorMessage }}</small>
    </ion-text>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmailInputComponent),
      multi: true,
    },
  ],
})
export class EmailInputComponent extends BaseInputComponent {
  onInput(event: any): void {
    this.handleInput(event);
  }

  onBlur(): void {
    this.handleBlur();
  }

  get hasError(): boolean {
    return !!(this.formControl?.invalid && this.formControl?.touched);
  }

  get errorMessage(): string {
    const errors = this.formControl?.errors;
    if (!errors) return '';

    if (errors['required']) return 'Email is required / 邮箱必填';
    if (errors['email']) return 'Invalid email format / 邮箱格式无效';

    return 'Invalid input / 输入无效';
  }
}
```

### 4.2 选择器组件 / Select Component

```typescript
// select-input.component.ts
@Component({
  selector: 'app-select-input',
  template: `
    <ion-item [disabled]="disabled">
      <ion-label position="floating" *ngIf="label">{{ label }}</ion-label>
      <ion-select
        [placeholder]="placeholder"
        [value]="value"
        [disabled]="disabled"
        [multiple]="multiple"
        (ionChange)="onSelectionChange($event)">
        <ion-select-option *ngFor="let option of options" [value]="option.value">
          {{ option.label }}
        </ion-select-option>
      </ion-select>
    </ion-item>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectInputComponent),
      multi: true,
    },
  ],
})
export class SelectInputComponent extends BaseInputComponent {
  @Input() options: Array<{ value: any; label: string }> = [];
  @Input() multiple = false;

  onSelectionChange(event: any): void {
    this.handleInput(event);
  }
}
```

---

## 第五部分：模块配置 / Part 5: Module Configuration

### 5.1 共享模块设置 / Shared Module Setup

```typescript
// shared/input-components/shared-input-components.module.ts
@NgModule({
  declarations: [
    GeneralSelectComponent,
    GeneralTextareaComponent,
    GeneralInputComponent,
    GeneralDateInputComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    MaskitoDirective,
  ],
  exports: [
    GeneralSelectComponent,
    GeneralTextareaComponent,
    GeneralInputComponent,
    GeneralDateInputComponent,
  ],
})
export class SharedInputComponentsModule {}
```
