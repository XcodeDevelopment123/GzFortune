# 🧩 Common Angular FormBuilder Bug & Fix Guide

This document explains a common mistake when using Angular Reactive Forms — specifically how to assign multiple validators to a single `FormControl` using `FormBuilder`. It includes the error message, root cause, and step-by-step fix.

---

## 🧨 Problem Description

When assigning **multiple synchronous validators** to a `FormControl`, forgetting to wrap them in an array causes Angular to misinterpret the second validator as an **async validator**. This leads to a runtime error.

### ❌ Incorrect Example

```ts
this.form = this.fb.group({
  email: ['', Validators.required, Validators.email], // ❌ WRONG: validators not wrapped in []
});
```

### 🛑 Error Message

```
ERROR RuntimeError: NG01101: Expected async validator to return Promise or Observable.
Are you using a synchronous validator where an async validator is expected?
```

---

## ✅ Correct Usage

Always wrap multiple validators in an array:

### ✅ Correct Example

```ts
this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]], // ✅ CORRECT
});
```

---

## 📘 Explanation

The method signature for `FormBuilder.group()` is:

```ts
fb.group({
  fieldName: [defaultValue, syncValidator(s), asyncValidator(s)],
});
```

If using **multiple synchronous validators**, they must be grouped in an array:

| Argument Position | Purpose                           |
| ----------------- | --------------------------------- |
| `0`               | Default value                     |
| `1`               | Sync validators (single or array) |
| `2`               | Async validators (optional)       |

---

## 🧯 Quick Fix Checklist

- [ ] Locate the affected `FormControl` in your form group
- [ ] If multiple validators are passed without brackets, wrap them in `[ ... ]`
- [ ] Save and recompile — the error should disappear

---

## 🧪 Comparison Summary

| ❌ Wrong                                      | ✅ Right                                        |
| --------------------------------------------- | ----------------------------------------------- |
| `['', Validators.required, Validators.email]` | `['', [Validators.required, Validators.email]]` |

---

## 🏷️ Tags

#Angular #FormBuilder #ReactiveForms #NG01101 #Validators #FormGroup

---

📄 This file is for internal documentation purposes. Helps quickly diagnose and fix common `FormBuilder` bugs in Angular projects.
