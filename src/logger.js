const ourDebug = require('./debug').spawn('logger');
const noop = (function() {});

module.exports = function({ loggerToWrap, decorLevels, doFileLine, debugApi, levelFns}) {
  const colorWrap = require('color-wrap');
  const memoize = require('memoizee');
  const internals = require('./logger.internals');

  ourDebug(() => ({ loggerToWrap, decorLevels, doFileLine, debugApi, levelFns}));


  class Logger {
    constructor(base, namespace) {

      let augmentedNamespace, forceDebugFileAndLine;
      this.base = base;
      this.namespace = namespace;
      if (typeof this.namespace !== 'string') {
        throw new Error('invalid logging namespace');
      }

      if (this.namespace === '') {
        augmentedNamespace = this.base+':__default_namespace__:';
        forceDebugFileAndLine = true;
      } else {
        if (!this.namespace.endsWith(':')) {
          this.namespace += ':';
        }
        augmentedNamespace = this.base+':'+this.namespace;
      }

      this.decorLevels = decorLevels;

      /*
        Override logObject.debug with a debug instance
        namespace is to be used as handle for controlling logging verbosity
        see: https://github.com/visionmedia/debug/blob/master/Readme.md
      */
      let debugInstance = debugApi(augmentedNamespace);
      //TODO: make this optional as an option
      // this allows forwarding of debug to the underlying debug call if enabled
      debugInstance.log = function() {
        let out = [].slice.call(arguments, 0);
        return loggerToWrap.debug.apply(loggerToWrap, out);
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
      for (let lvl of Array.from(levelFns)) {
        let foundLevel = (this.decorLevels != null ? this.decorLevels.indexOf(lvl) : undefined) >= 0;

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

    spawn(subNamespace) {
      return Logger.getLogger(this.base, this.namespace+subNamespace);
    }

    isEnabled(subNamespace) {
      if (subNamespace == null) { subNamespace = ''; }
      let suffix = (subNamespace !== '') && !subNamespace.endsWith(':') ? ':' : '';
      return debugApi.enabled(this.namespace+subNamespace+suffix);
    }
  }


  // cache logger results so we get consistent coloring
  let _getLogger = (baseNamespace, namespace) => new Logger(baseNamespace, namespace);

  Logger.getLogger = memoize(_getLogger, {primitive: true});

  return Logger;
};
