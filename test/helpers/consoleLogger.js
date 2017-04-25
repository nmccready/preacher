const Console = require('console').Console;
const util = require('util');

function ConsoleLogger(stdout, stderr) {
  stdout = stdout || process.stdout;
  stderr = stderr || process.stderr;
  Console.call(this, stdout, stderr);
}

util.inherits(ConsoleLogger, Console);

ConsoleLogger.prototype.on = function () {};

ConsoleLogger.prototype.info = function () {
  // forcing warn to be on stderr for easy hook testing
  return this.warn.apply(this, arguments);
}

ConsoleLogger.prototype.debug = ConsoleLogger.prototype.info;

ConsoleLogger.prototype.log = function () {
  // forcing warn to be on stderr for easy hook testing
  return this.warn.apply(this, arguments);
}


module.exports = ConsoleLogger;
