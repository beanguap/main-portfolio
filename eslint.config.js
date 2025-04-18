import js from '@eslint/js';
import globals from 'globals';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import jsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';

export default [
  { ignores: ['dist', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'] }, // Ignore config/lock files
  js.configs.recommended, // Use ESLint recommended base rules
  {
    // Base JS/JSX config
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest', // Use 'latest' instead of specific year
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'import/no-unresolved': 'error',
      // Disable no-unused-modules for now, can be noisy during development
      // 'import/no-unused-modules': ['warn', { missingExports: true, unusedExports: true }], 
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.scss'], // Add .scss
        },
        alias: { // Add alias configuration
          map: [
            ['@', './src'],
            ['@components', './src/components'],
            ['@utils', './src/utils'],
            ['@styles', './src/styles'],
            ['@assets', './src/assets'],
          ],
          extensions: ['.js', '.jsx', '.scss'], // Include extensions for alias resolver
        },
      },
    },
  },
  {
    // React specific config
    files: ['**/*.{jsx}'],
    ...reactRecommended, // Spread recommended React rules
    ...jsxRuntime, // Add rules for new JSX runtime
    plugins: {
      ...reactRecommended.plugins, // Include React plugin
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactRecommended.rules,
      ...jsxRuntime.rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off', // Disable prop-types if using TypeScript or prefer not to use them
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX runtime
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]