const eslint = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.lint.json'
      },
      globals: {
        performance: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        clearTimeout: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        globalThis: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        Headers: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-requiring-type-checking'].rules,
      ...prettierConfig.rules,
      
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      
      // General rules
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      
      // Prettier integration
      'prettier/prettier': 'error'
    }
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': 'off',
      'no-undef': 'off'
    }
  },
  {
    files: ['tests/setup.ts'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        expect: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-undef': 'off'
    }
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  },
  {
    files: ['examples/**/*.ts'],
    languageOptions: {
      globals: {
        console: 'readonly',
        require: 'readonly',
        module: 'readonly',
        process: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-undef': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn'
    }
  },
  {
    files: ['**/AiSeoDemo.ts', '**/demo/**/*.ts'],
    rules: {
      'no-console': 'off'
    }
  },
  {
    files: ['src/types/AdapterTypes.ts', 'tests/utils/seoMatchers.ts'],
    rules: {
      '@typescript-eslint/no-namespace': 'off'
    }
  },
  {
    files: ['src/ai/providers/**/*.ts', 'src/cache/**/*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/require-await': 'off',
      'no-console': 'warn'
    }
  },
  {
    files: ['src/schema/**/*.ts', 'src/core/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/require-await': 'warn'
    }
  },
  {
    ignores: [
      'dist/',
      'coverage/',
      'node_modules/',
      'examples/dist/',
      '*.config.js',
      '*.config.cjs',
      '**/*.js',
      '**/*.d.ts'
    ]
  }
];