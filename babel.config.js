/* eslint-disable import/no-extraneous-dependencies */
const babelConfig = require('@znemz/js-common-babel-config').default;
const { env } = require('@znemz/js-common-babel-config/lib/babel.config.internals');

module.exports = babelConfig({
  env: {
    ...env,
    production: {
      presets: env.production.presets,
      plugins: [
        ...env.production.plugins,
        'transform-react-remove-prop-types',
        'babel-plugin-minify-mangle-names', // keeps classNames but mangles fields
      ],
    },
  },
});
