// eslint.config.js
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  js.configs.recommended,
  // 忽略规则
  {
    ignores: ['projects/**/*', 'www', '**/*.spec.ts', 'src/assets/**', 'node_modules'],
  },

  // TS + Angular + Prettier
  ...compat.extends(
    'plugin:@angular-eslint/recommended',
    'plugin:@angular-eslint/template/process-inline-templates',
    'plugin:prettier/recommended',
  ),

  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: ['tsconfig.eslint.json'],
        createDefaultProgram: true,
      },
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'crlf',
          printWidth: 100, // 更宽松的限制，减少不必要换行
          tabWidth: 2, // 缩进宽度，推荐2，符合 JS/TS 社区标准
          semi: true, // 强制分号，减少歧义
          singleQuote: true, // 使用单引号，统一风格
          trailingComma: 'all', // 多行时尾逗号，方便git diff和代码维护
          bracketSameLine: true, // 标签闭合在同一行，提升可读性
          htmlWhitespaceSensitivity: 'css', // 按 CSS 规则格式化HTML空白
          arrowParens: 'always', // 箭头函数总是带括号，保持一致性
        },
      ],
      '@angular-eslint/prefer-standalone': 'off',
      '@angular-eslint/component-class-suffix': [
        'error',
        {
          suffixes: ['Page', 'Component'],
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
    },
  },

  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'unused-imports/no-unused-imports': 'warn',
    },
  },

  // HTML 模板检查
  ...compat.extends('plugin:@angular-eslint/template/recommended'),
];
