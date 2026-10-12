const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/**', 'checkpoints/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'commonjs', globals: globals.node },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
  {
    // Frontend: scripts clásicos que comparten el ámbito global (se cargan en orden desde index.html).
    files: ['public/js/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: { ...globals.browser, marked: 'readonly', DOMPurify: 'readonly', hljs: 'readonly' },
    },
    rules: { 'no-unused-vars': 'off', 'no-undef': 'off' }, // las funciones se usan entre archivos
  },
];
