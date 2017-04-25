const ourDebug = require('./debug').spawn('loggerFactory');

/*
  Public: Factory to create a debug namespace off of.

 - `loggerToWrap {object}`: logger object to wrap, {Winston, console, etc}
 - `debugApi {object}`: vision media debug, or one like it
 - `enable {string}`: Log levels to enable for the DEBUG namespace. Otherwise defaults to process.env.DEBUG
 - `levelFns {array[string]}`: Levels to evaulate and possibly wrap.
 - `doFileLine {bool}`: Turns on fileLine info on all log output.
 - `decorLevels {array[string]}`: levels to decorate, enable, and add lazyEval

  Returns a funciton to generate a base logger.
*/
module.exports = function({loggerToWrap, debugApi, enable, levelFns, doFileLine, decorLevels}) {
  if (debugApi == null)
    debugApi = require('debug');

  let normalLevels = ['info', 'warn', 'error'];

  if (levelFns == null)
    levelFns = normalLevels;
  if (decorLevels == null)
    decorLevels = levelFns;

  // we have no levelFns, so we disable all decor to make it all noop
  // setting levelFns to normalLevels allows all levelFns to be iterated to make them noop
  if (!levelFns.length) {
    levelFns = normalLevels;
    decorLevels = [];
  }

  if (!enable) {
    ourDebug(() => 'not enabled, defaulting to DEBUG env');
    debugApi.enable(process.env.DEBUG || null);
  } else {
    ourDebug(() => 'enabled');
    let names = enable.split(/[, ]/g);
    for (let i = 0; i < names.length; i++) {
      let name = names[i];
      if (name.endsWith('*')) {
        continue;
      } else if (name.endsWith(':')) {
        names[i] = name+'*';
      } else {
        names[i] = name+':*';
      }
    }
    names = names.concat((process.env.DEBUG||'').split(','));
    debugApi.enable(names.join(','));
  }


  let _isValidLogObject = function(logObject) {
    if ((logObject == null)) {
      return false;
    }
    for (let val of Array.from(levelFns)) {
      if ((logObject[val] == null) || (typeof logObject[val] !== 'function')) {
        return val;
      }
    }
    return true;
  };

  if (!loggerToWrap) {
    throw new Error('baselogger undefined');
  }
  let valid = _isValidLogObject(loggerToWrap);
  if (!valid) {
    throw new Error('baselogger is invalid');
  } else if (typeof 'string' === valid) {
    throw new Error(`baselogger is invalid on funciton ${valid}`);
  }


  let Logger = require('./logger')({
    loggerToWrap,
    decorLevels,
    doFileLine,
    debugApi,
    levelFns
  });
  ourDebug(() => 'Logger Bootstrapped');

  return function(baseNamespace) {
    ourDebug(() => 'creating log wrapper');
    return Logger.getLogger(baseNamespace, '');
  };
};
