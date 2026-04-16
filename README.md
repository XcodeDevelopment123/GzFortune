# Angular Coding Standards

## Overview

This document outlines the coding standards and best practices for our Angular project. Following these guidelines ensures consistent, maintainable, and readable code across the entire development team.

## Page Structure Standards

### 1. Consistent UI Layout

All pages must follow this unified structure for consistent user interface design:

```html
<app-header
  [rootPage]="''(refer to header.ts)''"
  [page]="''(refer to header.ts)''"
  [headerText]="'(refer to header.ts)'"></app-header>
<ion-content [fullscreen]="true">
  <div class="content-container">
    <!-- Your page content goes here -->
  </div>
</ion-content>
```

**Important:** All page content must be placed within the `content-container` div.

## TypeScript File Structure

### 2. Component Class Organization

Organize your TypeScript files with this structure:

```typescript
export class ExampleComponent {
  // 1. View Child / Input /Output first
  @ViewChild('header', { static: false, read: ElementRef }) headerRef!: ElementRef;
  @ViewChild('toolbar', { read: ElementRef }) toolbarRef!: ElementRef;

  // 2. Other variables
  public title: string = 'Example';
  public isLoading: boolean = false;
  private userId: number = 0;

  constructor(
    private router: Router,
    private service: ExampleService,
  ) {}

  // 3. Public methods (accessible by template/other components)
  public loadData(): void {
    // Implementation
  }

  handleClick(): void {
    // Implementation
  }

  // 4. Private methods (internal use only)
  private validateForm(): boolean {
    // Implementation
    return true;
  }

  private processData(): void {
    // Implementation
  }
}
```

**Rules:**

- Variables declared above constructor
- Methods declared below constructor
- Keep one empty line between methods
- Use `private` for methods not used by HTML templates or other components

## Code Organization & Refactoring

### 3. Service and Component Extraction

When code logic becomes complex or repetitive:

- **Extract to Services:** Move business logic, API calls, and data manipulation
- **Extract to Components:** Move reusable UI elements and functionality
- **Import and Use:** Always import and utilize these extracted modules

Example:

```typescript
// Before refactoring
export class UserComponent {
  private validateEmail(email: string): boolean {
    // Complex validation logic
  }

  private formatUserData(user: User): FormattedUser {
    // Complex formatting logic
  }
}

// After refactoring
export class UserComponent {
  constructor(
    private userService: UserService,
    private validationService: ValidationService,
  ) {}

  private validateEmail(email: string): boolean {
    return this.validationService.validateEmail(email);
  }

  private formatUserData(user: User): FormattedUser {
    return this.userService.formatUserData(user);
  }
}
```

## Naming Conventions

### 4. HTML Class Names

Use **kebab-case** for all CSS class names:

```html
<!-- Correct -->
<div class="user-profile-container">
  <div class="profile-header-section">
    <span class="user-display-name">John Doe</span>
  </div>
</div>

<!-- Incorrect -->
<div class="userProfileContainer">
  <div class="ProfileHeaderSection">
    <span class="user_display_name">John Doe</span>
  </div>
</div>
```

### 5. HTML ID Attributes

Use **camelCase** with `#` prefix for template reference variables:

```html
<!-- Correct -->
<input #userEmailInput type="email" />
<div #profileModal class="modal">
  <button #submitButton (click)="handleSubmit()">
    <!-- Incorrect -->
    <input #user-email-input type="email" />
    <div #profile_modal class="modal">
      <button #submit-button (click)="handleSubmit()"></button>
    </div>
  </button>
</div>
```

### 6. Method Names

Use **camelCase** for all method names:

```typescript
// Correct
public getUserProfile(): void { }
public handleFormSubmission() { }
private validateUserInput(): boolean { }

// Incorrect
public get_user_profile(): void { }
public HandleFormSubmission(): void { }
private validate-user-input(): boolean { }
```

## Type Safety Standards

### 7. Avoid Using `any` Type

**Never use `any` type.** Always specify proper types for better code safety and IntelliSense support.

```typescript
// Incorrect - Never do this
public userData: any;
public processData(data: any): any { }

// Correct - Always specify types
public userData: UserProfile;
public processData(data: UserProfile): ProcessedData { }
```

### 8. Avoid Hard-coded Values - Use Type Definitions

Never use hard-coded string or number values. Always define proper types using interfaces, types, enums, or union types:

```typescript
// Correct - Using interface/type definitions
interface UserProfile {
  id: number;
  name: string;
  status: "active" | "inactive" | "pending";
}

type UserRole = "admin" | "user" | "moderator";
type Theme = "light" | "dark" | "auto";

enum Priority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low"
}

public userStatus: "active" | "inactive" | "pending" = "pending";
public userRole: UserRole = "user";
public theme: Theme = "light";
public priority: Priority = Priority.MEDIUM;

// Minimum requirement - Use union types directly
public orderStatus: "processing" | "shipped" | "delivered" = "processing";
public paymentMethod: "credit" | "debit" | "paypal" = "credit";

// Incorrect - Hard-coded values without type constraints
public userStatus = "pending"; // No type constraint
public userRole = "user"; // No type constraint
public handleStatus(status) { // No parameter type
  if (status === "active") { // Hard-coded string comparison
    // ...
  }
}
```

### 9. Always Specify Types and Default Values

Provide explicit types and default values for all variables:

```typescript
// Correct
public isLoading: boolean = false;
public userCount: number = 0;
public userName: string = '';
public userList: User[] = [];
public selectedOption: "option1" | "option2" | "option3" = "option1";

// Incorrect - Missing types or default values
public isLoading;
public userCount: number;
public userName: string;
public userList;
```

### 10. Method Return Types

Always specify return types for methods:

```typescript
// Correct
public getUserById(id: number): User | null {
  return this.users.find(user => user.id === id) || null;
}

public validateForm(): boolean {
  return this.form.valid;
}

public async fetchUserData(): Promise<User[]> {
  return await this.userService.getUsers();
}

// Incorrect - Missing return types
public getUserById(id: number) {
  return this.users.find(user => user.id === id) || null;
}

public validateForm() {
  return this.form.valid;
}
```

## Code Maintenance

### 11. Remove Unused Code (CRITICAL)

**This is extremely important for long-term maintainability.**

#### What to Remove:

- Unused HTML elements and attributes
- Unused CSS classes and styles
- Unused TypeScript variables, methods, and imports
- Commented-out code blocks
- Dead code paths

#### How to Handle:

1. **Regular Code Cleanup:** Remove unused code during development
2. **Git Commit Practice:** Create specific commits for code removal
3. **Commit Message Format:**

   ```
   git commit -m "refactor: remove unused code from user-profile component

   - Removed unused validatePassword method
   - Removed unused .profile-sidebar CSS class
   - Removed commented HTML template code"
   ```

#### Benefits:

- Improved code readability
- Reduced bundle size
- Easier debugging and maintenance
- Better performance

**Remember:** Don't worry about losing code permanently. Git history preserves everything, so you can always recover if needed.

## Example Implementation

### Complete Component Example:

```typescript
// user-profile.component.ts
export class UserProfileComponent {
  public userProfile: UserProfile | null = null;
  public isEditing: boolean = false;
  public isLoading: boolean = false;
  private originalProfile: UserProfile | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private toastService: ToastService,
  ) {}

  public async loadUserProfile(): Promise<void> {
    this.isLoading = true;
    try {
      this.userProfile = await this.userService.getCurrentUser();
      this.originalProfile = { ...this.userProfile };
    } catch (error) {
      this.handleError('Failed to load user profile');
    } finally {
      this.isLoading = false;
    }
  }

  public enableEditMode(): void {
    this.isEditing = true;
  }

  public async saveProfile(): Promise<void> {
    if (!this.validateProfile()) {
      return;
    }

    try {
      await this.userService.updateProfile(this.userProfile!);
      this.isEditing = false;
      this.toastService.showSuccess('Profile updated successfully');
    } catch (error) {
      this.handleError('Failed to update profile');
    }
  }

  public cancelEdit(): void {
    this.userProfile = { ...this.originalProfile };
    this.isEditing = false;
  }

  private validateProfile(): boolean {
    return this.userProfile?.email && this.userProfile?.name ? true : false;
  }

  private handleError(message: string): void {
    this.toastService.showError(message);
    console.error(message);
  }
}
```

```html
<!-- account.page.html -->
<app-header [rootPage]="'account'" [page]="'account'" [headerText]="'Account'"></app-header>

<ion-content [fullscreen]="true" class="tabs">
  <div class="container">
    <app-account-user-card></app-account-user-card>
    <app-referral-card></app-referral-card>
    <app-option-page-card></app-option-page-card>

    <ion-label class="text-center text-sm text-description"> Version 2.0.1 (2) </ion-label>
  </div>
</ion-content>
<!-- account-user-card.component.html -->
<div class="card user-info-card">
  <div class="flex-space-between user-profile">
    <div class="flex-auto flex-center info">
      <div class="user-profile-picture flex-center">
        <img load="lazy" src="assets/images/user-profile-placeholder.png" />
      </div>
      <div>
        <p class="text-xl text-title truncate-two-line">Developer</p>
        <p>+60123456789</p>
        <p class="truncate-two-line">developer1212gmail.com</p>
      </div>
    </div>
    <div class="scan-qr flex-center" (click)="showQrModal()">
      <img load="lazy" src="assets/images/scan-qr.png" />
    </div>
  </div>

  <div
    class="flex-space-between flex-auto membership-progress-card"
    routerLink="/account/membership">
    <div class="membership">
      <div class="membership-point">
        <span class="text-lg text-title point">64</span>
        Points /
        <span class="text-lg text-title level">Regular</span>
        level
      </div>
      <div class="membership-progress flex-auto flex-center">
        <ion-progress-bar value="0.5"></ion-progress-bar>
      </div>
      <div class="membership-details">400 points more to reach VIP level</div>
    </div>

    <ion-icon class="text-xxl" name="chevron-forward-outline"></ion-icon>
  </div>
</div>
```

## Summary Checklist

Before submitting your code, ensure:

- [ ] Page follows the standard route-container structure
- [ ] Variables are declared above constructor
- [ ] Methods are declared below constructor with proper spacing
- [ ] Private methods are marked as `private`
- [ ] HTML classes use kebab-case
- [ ] HTML IDs use camelCase with # prefix
- [ ] Method names use camelCase
- [ ] No `any` types are used anywhere in the code
- [ ] All variables have explicit types and default values
- [ ] Union types are used directly instead of creating new type definitions
- [ ] Complex/repetitive logic is extracted to services or components
- [ ] All unused code has been removed
- [ ] Commit messages clearly describe what was removed

## Conclusion

Following these standards ensures our codebase remains clean, maintainable, and scalable. Regular adherence to these guidelines will improve development efficiency and code quality across the entire project.

For questions or suggestions regarding these standards, please consult with the development team lead.

---

## Change Log

| Date       | Version | Changes                                               | Updated By   |
| ---------- | ------- | ----------------------------------------------------- | ------------ |
| 2025-07-31 | 1.0     | Initial creation of Angular coding standards document | Ong Sen Hong |
