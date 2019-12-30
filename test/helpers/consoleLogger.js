const { Console } = require('console');
const util = require('util');

function ConsoleLogger(stdout, stderr) {
  stdout = stdout || process.stdout;
  stderr = stderr || process.stderr;
  Console.call(this, stdout, stderr);
}

util.inherits(ConsoleLogger, Console);

ConsoleLogger.prototype.on = function on() {};

ConsoleLogger.prototype.info = function info(...args) {
  // forcing warn to be on stderr for easy hook testing
  return this.warn(...args);
};

ConsoleLogger.prototype.debug = ConsoleLogger.prototype.info;

ConsoleLogger.prototype.log = function log(...args) {
  // forcing warn to be on stderr for easy hook testing
  return this.warn(...args);
};

module.exports = ConsoleLogger;
