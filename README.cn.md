# 项目开发指南

本文档整理了项目开发的命名规范、文件组织方式、通用服务用法、表单控件要求等内容，目的是确保代码整洁、一致、易于维护。请每位开发者务必遵守。

## 目录

1. [命名规范](#命名规范)
2. [代码结构规范](#代码结构规范)
3. [开发流程](#开发流程)
4. [组件拆分原则](#组件拆分原则)
5. [API 开发规范](#api-开发规范)
6. [加载屏幕使用](#加载屏幕使用)
7. [表单开发规范](#表单开发规范)
8. [输入组件使用](#输入组件使用)
9. [共享服务使用](#共享服务使用)
10. [代码质量控制](#代码质量控制)

---

## 命名规范

### 1. 变量和方法/函数命名

- **一律使用 camelCase**

```typescript
// ✅ 正确
const userName = 'john';
const userAge = 25;
const getUserInfo = () => {};
const calculateTotalPrice = () => {};

// ❌ 错误
const user_name = 'john';
const UserAge = 25;
const get_user_info = () => {};
```

### 2. 类名和接口名

- **一律使用 PascalCase**

```typescript
// ✅ 正确
class UserService {}
interface ApiResponse {}
class LoginComponent {}

// ❌ 错误
class userService {}
interface apiResponse {}
class loginComponent {}
```

---

## 代码结构规范

### TypeScript 文件结构

```typescript
export class ExampleComponent {
  // 📍 所有变量声明在 constructor 之上
  private userName: string = '';
  private userAge: number = 0;
  private isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private loadingHelper: LoadingHelperService,
  ) {
    // 构造函数逻辑
  }

  // 📍 所有方法在 constructor 之下，方法之间保持一个空行
  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    // 方法实现
  }

  getUserInfo() {
    // 方法实现
  }

  calculateTotal() {
    // 方法实现
  }
}
```

---

## 开发流程

### 1. 组件开发原则

- 开发时如果暂时无法确定页面是否需要拆分多个组件，可以直接开发
- 后续发现内容过多或可以拆分时，**必须进行拆分**

### 2. 组件拆分步骤

```bash
# 在对应页面目录下生成新组件
ionic g component page/user/components/user-profile

# 将相关的 CSS、TS、HTML 拆分到新组件
# 在父组件中引用新组件
```

### 3. 代码提交流程

```bash
# 每次 Push 代码到 GitHub 之前必须执行
npm run format

# 如果有错误必须修复后才能提交
# 确保代码格式化通过后再进行 git push
```

---

## 组件拆分原则

### 拆分时机

1. 单个页面内容超过 300 行代码 / 混乱
2. 页面包含多个独立功能模块
3. 有重复使用的 UI 片段

### 拆分方法

```typescript
// 父组件使用子组件
<app-user-profile
  [userData]="currentUser"
  (userUpdated)="onUserUpdated($event)">
</app-user-profile>
```

---

## API/Third-party service 规范

### 1. API 方法统一管理

- **所有 API 方法统一放在 `core/repo/api` 目录**

### 2. Request/Response 模型规范

```typescript
// ✅ 正确 - 定义明确的接口
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  token: string;
  user: UserInfo;
  expiresIn: number;
}

// API 方法实现
loginUser(request: LoginRequest): Observable<LoginResponse> {
  return this.http.post<LoginResponse>('/api/login', request);
}

// ❌ 错误 - 避免使用 any 或内联对象
loginUser(request: any): Observable<any> {}
loginUser(request: {email: string, password: string}): Observable<any> {}
```

### 3. API 文件结构示例

```
core/
├── repo/
│   ├── api/
│   │   ├── auth.api.ts
│   │   └── user.api.ts
│   │── request/
│   │       ├── auth.request.model.ts
│   │       └── user.request.model.ts
│   │── response/
│   │       ├── auth.response.model.ts
│   │       └── user.response.model.ts
```

---

## 加载屏幕使用

### 服务位置

- 由 `/shared/services/loading-helper.service.ts` 控制

### 使用方法

```typescript
import { LoadingHelperService } from '@shared/services/loading-helper.service';

export class ExampleComponent {
  constructor(private loadingHelper: LoadingHelperService) {}

  async loadData() {
    // 显示加载屏幕
    this.loadingHelper.show();

    try {
      // 执行异步操作
      const data = await this.apiService.getData();
      // 处理数据
    } finally {
      // 隐藏加载屏幕
      this.loadingHelper.hide();
    }
  }
}
```

### 自定义加载屏幕 UI

- 如需更改加载屏幕样式，编辑 `shared/components/loading` 目录下的文件

---

## 表单开发规范

### 必须使用 Reactive Forms

- **一律采用 ReactiveForm 进行表单开发**

### 标准表单实现

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class LoginComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      // 处理表单提交
    }
  }
}
```

### 表单模板

```html
<form *ngIf="form" [formGroup]="form" (ngSubmit)="onSubmit()">
  <app-general-input
    [title]="'邮箱'"
    [placeholder]="'请输入邮箱'"
    [boldTitle]="true"
    formControlName="email">
  </app-general-input>

  <app-password-input [title]="'密码'" formControlName="password"> </app-password-input>

  <ion-button type="submit" mode="ios" [disabled]="form.invalid || form.disabled">
    登录
  </ion-button>
</form>
```

---

## 输入组件使用

### 1. 通用输入组件

- **没有特殊需求时一律使用 `app-general-input`**

```html
<app-general-input
  [title]="'用户名'"
  [placeholder]="'请输入用户名'"
  [boldTitle]="true"
  [required]="true"
  formControlName="username">
</app-general-input>
```

### 2. 常用输入组件属性

| 属性        | 类型    | 说明         | 默认值 |
| ----------- | ------- | ------------ | ------ |
| title       | string  | 输入框标题   | ''     |
| placeholder | string  | 占位符文本   | ''     |
| boldTitle   | boolean | 标题是否加粗 | false  |

### 3. 创建自定义输入组件

- 参考 `shared/input-components/README.md`
- **必须实现 `ControlValueAccessor` 接口**

```typescript
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputComponent),
      multi: true,
    },
  ],
})
export class CustomInputComponent implements ControlValueAccessor {
  // 实现 ControlValueAccessor 接口方法
  writeValue(value: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
  setDisabledState(isDisabled: boolean): void {}
}
```

### 4. 启用 / 禁用输入组件（Enable / Disable）

- **可使用 Angular 表单 API disable() 与 enable() 控制字段状态**
- **常见于编辑场景的只读、可编辑切换**

**✅ 初始化禁用字段**

```
this.form = this.fb.group({
  email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
  password: ['', [Validators.required]],
});
```

**✅ 动态控制字段状态**

```
// 禁用 email 字段
this.form.get('email')?.disable();

// 启用 email 字段
this.form.get('email')?.enable();
```

⚠️ 被禁用字段不会包含在 form.value 中，需用 form.getRawValue() 获取完整数据

---

## 共享服务使用

### 可用的共享服务

项目中已包含多个共享服务，位于 `shared/services/` 目录：

| 服务名称       | 功能描述         | 使用场景                 |
| -------------- | ---------------- | ------------------------ |
| alert-helper   | 弹窗提示         | 成功/错误/警告提示       |
| app            | 应用级别状态管理 | 全局配置和状态           |
| date-helper    | 日期处理         | 日期格式化、计算         |
| device-info    | 设备信息         | 获取设备相关信息         |
| image-helper   | 图片处理         | 图片上传、压缩、格式转换 |
| loading-helper | 加载状态         | 显示/隐藏加载屏幕        |
| state-session  | 会话状态         | 用户会话管理             |
| storage-helper | 本地存储         | 数据持久化存储           |
| string-helper  | 字符串处理       | 字符串格式化、验证       |

### 创建新的共享服务

如需创建新的功能服务，请：

1. 参考现有服务的实现方式
2. 遵循单一职责原则
3. 提供完整的 TypeScript 类型定义
4. 添加适当的错误处理

---

## 代码质量控制

### 1. 提交前检查清单

- [ ] 运行 `npm run format` 并修复所有错误
- [ ] 确保代码遵循命名规范
- [ ] 检查是否有未使用的导入和变量
- [ ] 确认 API 请求/响应有明确的类型定义

### 2. 代码审查要点

1. **命名规范**：变量使用 camelCase，类名使用 PascalCase
2. **结构规范**：变量在构造函数之上，方法之间有空行
3. **类型安全**：尽可能避免使用 `any` 类型
4. **组件拆分**：单个文件不超过 300 行 / 可多过但是要易读
5. **服务使用**：优先使用现有共享服务/添加到该服务再使用

### 3. 性能优化建议

1. 及时取消订阅 Observable
2. 使用 TrackBy 函数优化 `*ngFor`
3. 延迟加载非核心模块

---

## 项目结构建议

```
src/
├── app/
│   ├── core/                 # 核心模块
│   │   ├── repo/
│   │   │   └── api/         # API 接口
│   │   └── guards/          # 路由守卫
│   ├── shared/              # 共享模块
│   │   ├── components/      # 共享组件
│   │   ├── services/        # 共享服务
│   │   └── input-components/ # 输入组件
│   └── pages/               # 页面组件
├── assets/                  # 静态资源
└── environments/            # 环境配置
```

---

## 总结

遵循本开发指南可以确保：

- **代码一致性**：统一的命名和结构规范
- **可维护性**：清晰的组件拆分和服务使用
- **类型安全**：完整的 TypeScript 类型定义
- **开发效率**：复用现有组件和服务
- **代码质量**：严格的提交前检查流程

请在开发过程中严格遵守以上规则，确保项目代码的稳定性和可维护性。如有疑问，请参考现有代码实现或咨询项目负责人。
