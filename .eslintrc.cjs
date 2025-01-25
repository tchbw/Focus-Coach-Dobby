const restrictOtherDateLibraries = [
  {
    group: [`date-fns`],
    message: `Use dayjs from "@shared/init/dayjs" instead of date-fns`,
  },
  {
    group: [`moment`],
    message: `Use dayjs from "@shared/init/dayjs" instead of moment`,
  },
  {
    group: [`dayjs`, `!@shared/init/dayjs`],
    message: `Use dayjs from "@shared/init/dayjs" instead`,
    allowTypeImports: true,
  },
  {
    group: [`dayjs/plugin/*`],
    message: `All dayjs plugins should be defined in "@shared/init/dayjs"`,
  },
];

module.exports = {
  extends: [
    `eslint:recommended`,
    `plugin:react/recommended`,
    `plugin:react/jsx-runtime`,
    `@electron-toolkit/eslint-config-ts/recommended`,
    // `@electron-toolkit/eslint-config-prettier`,
  ],
  overrides: [
    {
      files: [`*.d.ts`],
      rules: {
        quotes: `off`,
      },
    },
  ],
  rules: {
    "react/prop-types": `off`,
    quotes: [`error`, `backtick`],
    "@typescript-eslint/no-unused-vars": [
      `error`,
      {
        argsIgnorePattern: `^_`,
        varsIgnorePattern: `^_`,
      },
    ],
    "@typescript-eslint/no-restricted-imports": [
      `error`,
      {
        patterns: [...restrictOtherDateLibraries],
      },
    ],
  },
};
