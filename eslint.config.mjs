import prettier from 'eslint-plugin-prettier';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const eslintConfig = {
  ignores: ['.next'],

  settings: [
    ...compat.extends(
      'next',
      'next/core-web-vitals',
      'plugin:prettier/recommended'
    ),
    {
      plugins: {
        prettier,
        '@typescript-eslint': typescriptEslint,
      },

      rules: {
        'prettier/prettier': [
          'error',
          {
            endOfLine: 'auto',
          },
        ],

        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
      },
    },
  ],
};

export default eslintConfig;
