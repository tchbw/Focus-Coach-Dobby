/** @type {import("prettier").Config} */
const config = {
  plugins: [require.resolve(`prettier-plugin-tailwindcss`)],
  trailingComma: `es5`,
};

module.exports = config;
