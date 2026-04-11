import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import-x'
import nodePlugin from 'eslint-plugin-n'
import pluginPromise from 'eslint-plugin-promise'
import pluginSecurity from 'eslint-plugin-security'
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort'
import sonarJS from 'eslint-plugin-sonarjs'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import unusedImportsPlugin from 'eslint-plugin-unused-imports'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
// import noSecrets from 'eslint-plugin-no-secrets'
// import json from '@eslint/json'
import biome from 'eslint-config-biome'

export default defineConfig([
  {
    ignores: [
      'dist/**',
      'prisma/seed*.js',
      'node_modules/**',
      '**/src/generated/**',
      '/.git',
      '/.husky',
      '**/*.d.ts',
      'prisma.config.ts',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      nodePlugin.configs['flat/recommended-script'],
      eslintPluginUnicorn.configs.recommended,
      pluginPromise.configs['flat/recommended'],
      pluginSecurity.configs.recommended,
      sonarJS.configs.recommended,
    ],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: globals.nodeBuiltin,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImportsPlugin,
      'simple-import-sort': simpleImportSortPlugin,
      // 'no-secrets': noSecrets,
    },
    rules: {
      // generic
      'no-console': 'error',
      'no-throw-literal': 'error',

      // import
      'import/order': 'off',
      'import/no-commonjs': 'error',
      'import/no-duplicates': 'error',
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],

      // simple import sort
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // unused imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'off',

      // eslint-plugin-node
      'n/no-process-exit': 'off',
      'n/no-process-env': 'error',
      'n/prefer-node-protocol': 'error',
      'n/no-missing-import': 'off',
      'n/no-unpublished-import': 'off',
      'n/prefer-global/process': 'error',
      'n/prefer-global/buffer': 'error',
      'n/prefer-promises/dns': 'error',
      'n/prefer-promises/fs': 'error',

      // Security rules - important for backend APIs
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'warn',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-new-buffer': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'error',

      // SonarJS rules - code quality and bug prevention
      // 'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 3 }],
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-small-switch': 'error',
      'sonarjs/prefer-immediate-return': 'warn',
      'sonarjs/prefer-object-literal': 'warn',
      'sonarjs/prefer-single-boolean-return': 'warn',
      'sonarjs/no-nested-template-literals': 'warn',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/no-useless-catch': 'error',
      'sonarjs/todo-tag': 'off',
      'sonarjs/no-commented-code': 'off',
      'sonarjs/function-return-type': 'off',
      'sonarjs/no-empty-test-file': 'off',
      'sonarjs/no-alphabetical-sort': 'off',
      'sonarjs/no-unused-vars': 'off',
      'sonarjs/fixme-tag': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/unused-import': 'off',

      // promise
      'promise/prefer-await-to-then': 'warn',
      'promise/prefer-await-to-callbacks': 'warn',

      // unicorn
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-negated-condition': 'off',
      'unicorn/no-empty-file': 'off', // just setting up folder structure

      // no secrets
      // 'no-secrets/no-secrets': ['error', { tolerance: 4 }],

      // @typescript-eslint
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/comma-dangle': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',

      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
    },
  },

  biome,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',

      // unused imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'off',

      // simple import sort
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // import
      'import/order': 'off',
      'import/no-commonjs': 'error',
      'import/no-duplicates': 'error',
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
])
