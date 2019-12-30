module.exports = ({ loggerToWrap, decorLevels, doFileLine, debugApi, levelFns, Logger }) => {
  const memoize = require('memoizee');
  const LoggerClass = Logger || require('./logger');

  function getCachedLogger(baseNamespace, namespace) {
    return new LoggerClass(baseNamespace, namespace, {
      decorLevels,
      debugApi,
      loggerToWrap,
      doFileLine,
      levelFns,
    });
  }

  LoggerClass.prototype.spawn = function spawn(subNamespace) {
    return getCachedLogger(this.base, this.namespace + subNamespace);
  };

  LoggerClass.getLogger = memoize(getCachedLogger, { primitive: true });

  return LoggerClass;
};
