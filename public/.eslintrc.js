module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  root: true,

  // https://eslint.vuejs.org/user-guide/#how-to-use-a-custom-parser
  // Must use parserOptions instead of "parser" to allow vue-eslint-parser to keep working
  // `parser: 'vue-eslint-parser'` is already included with any 'plugin:vue/**' config and should be omitted
  parserOptions: {
    parser: require.resolve('@typescript-eslint/parser'),
    extraFileExtensions: [ '.vue' ]
  },

  env: {
    browser: true,
    es2021: true,
    node: true,
    'vue/setup-compiler-macros': true
  },

  // Rules order is important, please avoid shuffling them
  extends: [
    // Base ESLint recommended rules
    // 'eslint:recommended',

    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#usage
    // ESLint typescript rules
    'plugin:@typescript-eslint/recommended',

    // Uncomment any of the lines below to choose desired strictness,
    // but leave only one uncommented!
    // See https://eslint.vuejs.org/rules/#available-rules
    'plugin:vue/vue3-essential', // Priority A: Essential (Error Prevention)
    // 'plugin:vue/vue3-strongly-recommended', // Priority B: Strongly Recommended (Improving Readability)
    // 'plugin:vue/vue3-recommended', // Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead)

    'standard'
    
  ],

  plugins: [
    // required to apply rules which need type information
    '@typescript-eslint',

    // https://eslint.vuejs.org/user-guide/#why-doesn-t-it-work-on-vue-files
    // required to lint *.vue files
    'vue'
    
  ],

  globals: {
    ga: 'readonly', // Google Analytics
    cordova: 'readonly',
    __statics: 'readonly',
    __QUASAR_SSR__: 'readonly',
    __QUASAR_SSR_SERVER__: 'readonly',
    __QUASAR_SSR_CLIENT__: 'readonly',
    __QUASAR_SSR_PWA__: 'readonly',
    process: 'readonly',
    Capacitor: 'readonly',
    chrome: 'readonly'
  },

  // add your custom rules here
  rules: {
    'import/first': 'off',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'import/no-duplicates': 0,
    'import/order': 0,
    'import/newline-after-import': 0,
    'prefer-promise-reject-errors': 'off',
    'prefer-const': 0,
    'no-multi-spaces': 0,
    'no-trailing-spaces': 0,
    'no-throw-literal': 0,
    'no-case-declarations': 0,
    'no-empty-pattern': 0,
    'no-dupe-keys': 0,
    'no-unneeded-ternary': 0,
    'no-tabs': 'off',
    'no-void': 'off',
    'no-param-reassign': 'off',
    'no-underscore-dangle': "off",
    'no-shadow': 'off',
    'no-unused-vars': 0,
    'no-await-in-loop': "off",
    'no-else-return': 'off',
    'semi': 0,
    'indent': 0,
    // [ 2, 4, { 'SwitchCase': 1 } ],
    'key-spacing': 0,
    'space-in-parens': 0,
    'spaced-comment': 0,
    'object-curly-spacing': 0,
    'comma-dangle': 0,
    'space-before-function-paren': 0,
    'padded-blocks': 0,
    'keyword-spacing': 0,
    'brace-style': 0,
    'eol-last': 0,
    'curly': 0,
    // 'eslint-disable-next-line': 0,
    'computed-property-spacing': 0,
    'array-bracket-spacing': 0,
    'eqeqeq': 0,
    'arrow-parens': 0,
    'max-len': ["off", {
      "ignoreUrls": true
    }],
    'func-names': "off",
    "arrow-body-style": ["error", "always"],
    'nonblock-statement-body-position': 'off',
    'one-var': 'off',
    'consistent-return': 'off',
    'object-property-newline': 'off',
    'arrow-body-style': 'off',
    'no-use-before-define': 'off',
    'object-curly-newline': 'off',
    'no-lonely-if': 'off',
    'func-call-spacing': 'off',
    'no-restricted-syntax': 'off',
    'prefer-destructuring': 'off',
    'strictNullChecks': 'off',
    'vue/no-mutating-props': 1,
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-components': 0,
    'vue/no-setup-props-destructure': 'off',
    // TypeScript
    quotes: ['warn', 'single', {
      avoidEscape: true
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    "@typescript-eslint/no-explicit-any": "off",
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
