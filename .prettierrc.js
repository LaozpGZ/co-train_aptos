module.exports = {
  // Basic formatting
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  insertPragma: false,
  requirePragma: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  vueIndentScriptAndStyle: false,
  embeddedLanguageFormatting: 'auto',

  // Indentation
  tabWidth: 2,
  useTabs: false,

  // Line length
  printWidth: 80,

  // Plugin configurations
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
    'prettier-plugin-organize-attributes',
  ],

  // Import sorting configuration
  importOrder: [
    '^react$',
    '^next/(.*)$',
    '<THIRD_PARTY_MODULES>',
    '^@/(.*)$',
    '^@cotrain/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderBuiltinModulesToTop: true,
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderMergeDuplicateImports: true,
  importOrderCombineTypeAndValueImports: true,

  // Tailwind CSS configuration
  tailwindConfig: './tailwind.config.js',
  tailwindFunctions: ['clsx', 'cn', 'cva'],

  // Attribute organization
  attributeGroups: [
    '$ANGULAR_STRUCTURAL_DIRECTIVE',
    '$ANGULAR_ELEMENT_REF',
    '$ID',
    '$CLASS',
    '$ANGULAR_ANIMATION',
    '$ANGULAR_ANIMATION_INPUT',
    '$ANGULAR_INPUT',
    '$ANGULAR_TWO_WAY_BINDING',
    '$ANGULAR_OUTPUT',
    'key',
    'ref',
    'className',
    'style',
    'data-*',
    'aria-*',
    'role',
    'tabIndex',
    'id',
    'name',
    'type',
    'value',
    'defaultValue',
    'placeholder',
    'disabled',
    'required',
    'readOnly',
    'autoFocus',
    'autoComplete',
    'multiple',
    'checked',
    'defaultChecked',
    'selected',
    'defaultSelected',
    'href',
    'target',
    'rel',
    'download',
    'src',
    'srcSet',
    'alt',
    'width',
    'height',
    'loading',
    'onClick',
    'onChange',
    'onSubmit',
    'onFocus',
    'onBlur',
    'onKeyDown',
    'onKeyUp',
    'onMouseEnter',
    'onMouseLeave',
    'onMouseDown',
    'onMouseUp',
    'onTouchStart',
    'onTouchEnd',
    'onScroll',
    'onLoad',
    'onError',
    '$DEFAULT',
  ],

  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
        tabWidth: 2,
      },
    },
    {
      files: '*.mdx',
      options: {
        printWidth: 100,
        proseWrap: 'always',
        tabWidth: 2,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: '*.css',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.scss',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.less',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.html',
      options: {
        printWidth: 120,
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
    {
      files: '*.svg',
      options: {
        parser: 'html',
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
    {
      files: 'package.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    {
      files: 'tsconfig.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    {
      files: '.eslintrc.js',
      options: {
        printWidth: 100,
        tabWidth: 2,
      },
    },
    {
      files: '*.config.js',
      options: {
        printWidth: 100,
        tabWidth: 2,
      },
    },
    {
      files: '*.config.ts',
      options: {
        printWidth: 100,
        tabWidth: 2,
      },
    },
    {
      files: 'Dockerfile*',
      options: {
        parser: 'sh',
        printWidth: 120,
      },
    },
    {
      files: '*.sh',
      options: {
        parser: 'sh',
        printWidth: 120,
        tabWidth: 2,
        useTabs: false,
      },
    },
    {
      files: 'Makefile',
      options: {
        parser: 'sh',
        printWidth: 120,
        tabWidth: 4,
        useTabs: true,
      },
    },
    {
      files: '*.toml',
      options: {
        parser: 'toml',
        printWidth: 100,
        tabWidth: 2,
      },
    },
    {
      files: '*.move',
      options: {
        parser: 'rust',
        printWidth: 100,
        tabWidth: 4,
        useTabs: false,
      },
    },
    {
      files: '*.rs',
      options: {
        parser: 'rust',
        printWidth: 100,
        tabWidth: 4,
        useTabs: false,
      },
    },
    {
      files: '*.sql',
      options: {
        parser: 'sql',
        printWidth: 120,
        tabWidth: 2,
        useTabs: false,
        keywordCase: 'upper',
        identifierCase: 'lower',
        functionCase: 'upper',
        datatypeCase: 'upper',
      },
    },
    {
      files: '*.graphql',
      options: {
        parser: 'graphql',
        printWidth: 100,
        tabWidth: 2,
      },
    },
    {
      files: '*.gql',
      options: {
        parser: 'graphql',
        printWidth: 100,
        tabWidth: 2,
      },
    },
  ],
};