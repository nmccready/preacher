let logger;
require('chai').should();
const Promise = require('bluebird');
const sinon = require('sinon');
const preacher = require('../src/index');

let loggerToWrap = (logger = undefined);
const { runTest } = require('./helpers/hookHelper');
const consoleLogger = require('./helpers/consoleLogger');
const debug = require('debug');

debug.save('test:console*');
debug.enable(debug.load());


describe('wrapping console', function() {
  beforeEach(() => loggerToWrap = new consoleLogger());

  it('all nonLazy', function() {
    let namespace = 'test:console:nonLazy';
    logger = preacher({
      loggerToWrap,
      enable: 'test:console',
      doFileLine: false})(namespace);

    let debugTest = runTest({output: 'debug', namespace}, () => logger.debug('debug'));

    let mapped = Promise.map(['info', 'warn', 'error'], lvl =>
      runTest({output: lvl}, () => logger[lvl](lvl))
    );

    return Promise.all([debugTest, mapped]);
});

  it('lazy', function() {
    let namespace = 'test:console:nonLazy';
    logger = preacher({
      loggerToWrap,
      enable: 'test:console',
      doFileLine: true})(namespace);

    let debugTest = runTest({output: 'debug', namespace}, () => logger.debug(() => 'debug'));

    let mapped = Promise.map(['info', 'warn', 'error'], lvl =>
      runTest({output: lvl}, () => logger[lvl](() => lvl))
    );

    return Promise.all([debugTest, mapped]);
});

  describe('doFileLine falsy', function() {
    it('__default_namespace__', function() {
      let namespace;
      logger = preacher({
        loggerToWrap,
        enable: 'test:console'
        })(namespace = 'test:console:doFileLine');

      let debugTest = runTest({output: 'debug', namespace, regex: /\[.*\:\d*\]/}, () => logger.debug(() => 'debug'));

      let mapped = Promise.map(['info', 'warn', 'error'], lvl =>
        runTest({output: lvl}, () => logger[lvl](() => lvl))
      );

      return Promise.all([debugTest, mapped]);
  });

    return it('child', function() {
      let namespace;
      logger = preacher({
        loggerToWrap,
        enable: 'test:console'
        })(namespace = 'test:console:doFileLine');

      logger = logger.spawn('child');

      // make sure the child does not have file and line number | format | [index.test:64]
      let opts = {output: 'debug', namespace: namespace + ':child', notRegex: /\[.*\:\d*\]/};

      let debugTest = runTest(opts, () => logger.debug(() => 'debug'));

      let mapped = Promise.map(['info', 'warn', 'error'], lvl =>
        runTest({output: lvl}, () => logger[lvl](() => lvl))
      );

      return Promise.all([debugTest, mapped]);
  });
});

  return describe('disabled', function() {
    it('noLazy', function() {
      let stubbed = sinon.stub(loggerToWrap);
      let namespace = 'nothing';
      logger = preacher({
        loggerToWrap,
        enable: '',
        levelFns: [],
        doFileLine: true})(namespace);

      logger.debug('debug');
      stubbed.debug.called.should.not.be.ok;

      return ['info', 'warn', 'error'].forEach(function(lvl) {
        logger[lvl](lvl);
        return stubbed[lvl].called.should.not.be.ok;
      });
    });

    return it('lazy', function() {
      let stubbed = sinon.stub(loggerToWrap);
      let namespace = 'nothing';
      logger = preacher({
        loggerToWrap,
        enable: '',
        levelFns: [],
        doFileLine: true})(namespace);

      logger.debug(() => 'debug');
      stubbed.debug.called.should.not.be.ok;

      return ['info', 'warn', 'error'].forEach(function(lvl) {
        logger[lvl](() => lvl);
        return stubbed[lvl].called.should.not.be.ok;
      });
    });
  });
});
