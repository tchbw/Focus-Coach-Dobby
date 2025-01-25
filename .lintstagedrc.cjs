const path = require("path");

const runTsc = () => `pnpm run typecheck`; // --project ./tsconfig.react-jsx.json Function syntax allows us ignore files and run tsc on entire codebase
module.exports = {
  "*.{cjs,mjs,js,jsx,ts,tsx}": `eslint --fix`,
  "*.ts*": runTsc,
  "*": `prettier --list-different --ignore-unknown --write`,
};
