module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['features/step_definitions/**/*.cjs'],
    format: [
      '@cucumber/pretty-formatter'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    publishQuiet: true,
    dryRun: false,
    failFast: false,
    strict: false
  }
};