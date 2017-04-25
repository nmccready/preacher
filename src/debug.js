const pkg = require('../package.json');
module.exports = require('debug-fabulous').spawnable(pkg.name);
