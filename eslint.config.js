// eslint.config.js - ESLint 9 flat-config (ASCII-only)
// -----------------------------------------------
// Imports
import js from '@eslint/js';
import reactThreePlugin from '@react-three/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedPlugin from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default [
  // Ignore generated and lock files
  { ignores: ['dist', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'] },

  // Built-in recommended rules
  js.configs.recommended,

  // React presets (flat-ready)
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],

  // Manual wiring for React Hooks (not flat-ready yet)
  {
    plugins: { 'react-hooks': reactHooksPlugin },
    rules: reactHooksPlugin.configs.recommended.rules,
  },

  // Project-specific settings and extra plugins
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser },
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.scss'] },
        alias: {
          map: [
            ['@', './src'],
            ['@components', './src/components'],
            ['@utils', './src/utils'],
            ['@styles', './src/styles'],
            ['@assets', './src/assets'],
          ],
          extensions: ['.js', '.jsx', '.scss'],
        },
      },
    },
    plugins: {
      import: importPlugin,
      'react-refresh': reactRefresh,
      '@react-three': reactThreePlugin,
      'unused-imports': unusedPlugin,
    },
    rules: {
      // Base
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Import plugin
      'import/no-unresolved': 'error',
      // React
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'error',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-unknown-property': 'off',
      // React Refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Unused imports
      'unused-imports/no-unused-imports': 'error',
    },
  },
];
