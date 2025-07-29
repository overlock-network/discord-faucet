const eslintPluginImport = require("eslint-plugin-import");
const eslintPluginN = require("eslint-plugin-n");
const eslintPluginPromise = require("eslint-plugin-promise");
const jsStandard = require("eslint-config-standard");

module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        module: "readonly",
        require: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    plugins: {
      import: eslintPluginImport,
      n: eslintPluginN,
      promise: eslintPluginPromise,
    },
    rules: jsStandard.rules,
  },
];
