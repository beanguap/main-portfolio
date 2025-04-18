import js from '@eslint/js';
import { default as reactThreePlugin } from '@react-three/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import pluginUnused from "eslint-plugin-unused-imports";
import globals from 'globals';

export default [
  { ignores: ['dist', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'] }, // Ignore config/lock files
  {
    // Combined JS/JSX config
    files: ['**/*.{js,jsx}'], // Apply to both JS and JSX files
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
      },
    },
    plugins: { // Include all relevant plugins here
      import: importPlugin,
      'react': reactRecommended.plugins.react, // Use the actual plugin object
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@react-three': reactThreePlugin, // replaced require() with reactThreePlugin
      "unused-imports": pluginUnused
    },
    settings: { // Merge settings
      react: {
        version: 'detect', // Automatically detect React version
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.scss'],
        },
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
    rules: {
      // Base ESLint Recommended Rules
      ...js.configs.recommended.rules,

      // Base 'no-unused-vars' rule - this is the one we need react/jsx-uses-vars to influence
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],

      // Import plugin rules
      'import/no-unresolved': 'error',

      // React Recommended Rules
      ...reactRecommended.rules,

      // JSX Runtime Rules
      ...jsxRuntime.rules,

      // React Hooks Rules
      ...reactHooks.configs.recommended.rules,

      // Explicitly ensure JSX vars rule is active
      'react/jsx-uses-vars': 'error',

      // Explicitly ensure React usage rule is active (might be redundant with jsxRuntime)
      'react/jsx-uses-react': 'error',

      // Overrides/Disables for React
      'react/prop-types': 'off', // Disable prop-types
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX runtime

      // Disable unknown property checking for three‑fiber props
      'react/no-unknown-property': 'off',

      // React Refresh Rule
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // New rules:
      "unused-imports/no-unused-imports": "error"
    },
  },
  // Any other specific overrides can go in separate objects here if needed
]