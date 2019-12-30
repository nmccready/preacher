const colorWrap = require('color-wrap');
const internals = require('./logger.internals');

const noop = () => {};

class Logger {
  constructor(base, namespace, { decorLevels, debugApi, loggerToWrap, doFileLine, levelFns }) {
    const ourDebug = require('./debug').spawn('logger');
    ourDebug(() => ({ loggerToWrap, decorLevels, doFileLine, debugApi, levelFns }));

    let augmentedNamespace, forceDebugFileAndLine;
    this.base = base;
    this.namespace = namespace;
    if (typeof this.namespace !== 'string') {
      throw new Error('invalid logging namespace');
    }

    if (this.namespace === '') {
      augmentedNamespace = `${this.base}:__default_namespace__:`;
      forceDebugFileAndLine = true;
    } else {
      if (!this.namespace.endsWith(':')) {
        this.namespace += ':';
      }
      augmentedNamespace = `${this.base}:${this.namespace}`;
    }

    this.decorLevels = decorLevels;

    /*
      Override logObject.debug with a debug instance
      namespace is to be used as handle for controlling logging verbosity
      see: https://github.com/visionmedia/debug/blob/master/Readme.md
    */
    this.debugApi = debugApi;
    const debugInstance = debugApi(augmentedNamespace);
    // TODO: make this optional as an option
    // this allows forwarding of debug to the underlying debug call if enabled
    debugInstance.log = function log(...args) {
      return loggerToWrap.debug(...args);
    };

    // add lazy eval, and maybe decorate output
    if (!debugInstance.enabled) {
      this.debug = noop;
    } else if ((forceDebugFileAndLine || doFileLine) && !global.window) {
      this.debug = internals.decorateOutput(debugInstance);
    } else {
      this.debug = internals.resolveOutput(debugInstance);
    }

    // add lazy eval, and maybe decorate output to all other functions as well
    const levels = Array.from(levelFns);
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const i in levels) {
      const lvl = levels[i];
      const foundLevel =
        (this.decorLevels != null ? this.decorLevels.indexOf(lvl) : undefined) >= 0;

      if (!foundLevel) {
        // ourDebug -> '!foundLevel : ' + lvl
        this[lvl] = noop;
      } else if ((forceDebugFileAndLine || doFileLine) && !global.window) {
        this[lvl] = internals.decorateOutput(loggerToWrap[lvl], loggerToWrap);
      } else {
        this[lvl] = internals.resolveOutput(loggerToWrap[lvl], loggerToWrap);
      }
    }

    colorWrap(this);
  }

  isEnabled(subNamespace) {
    if (subNamespace == null) {
      subNamespace = '';
    }
    const suffix = subNamespace !== '' && !subNamespace.endsWith(':') ? ':' : '';
    return this.debugApi.enabled(this.namespace + subNamespace + suffix);
  }
}

module.exports = Logger;
