let logger;
require('chai').should();
const Promise = require('bluebird');
const sinon = require('sinon');
const preacher = require('../src');
// const rimraf = 'rimraf';

let loggerToWrap = (logger = undefined);
const { runTest } = require('./helpers/hookHelper');
let logLevels = ['info', 'warn', 'debug', 'error'];

const debug = require('debug');
let namespace = 'test:winston';
debug.save(`${namespace}*`);
debug.enable(debug.load());

describe('wrapping winston', function() {

  beforeEach(function() {
    // rimraf.sync('test.log')#keep log fresh
    let winston = require('winston');
    return loggerToWrap = new winston.Logger({
      level: 'debug',
      transports: [
        new winston.transports.Console({stderrLevels: logLevels}),
        new winston.transports.File({filename: 'test.log'})
      ]});});

  it('all nonLazy', function() {
    logger = preacher({
      loggerToWrap,
      enable: 'test:winston',
      doFileLine: true
      })(namespace).spawn('nonLazy');

    return Promise.map(logLevels, lvl =>
      runTest({output: lvl}, () => logger[lvl](lvl))
    );
  });

  it('all lazy', function() {
    logger = preacher({
      loggerToWrap,
      enable: 'test:winston',
      doFileLine: true
      })(namespace).spawn('lazy');

    return Promise.map(logLevels, lvl =>
      runTest({output: lvl}, () => logger[lvl](() => lvl))
    );
  });

  describe('doFileLine falsy', function() {
    it('__default_namespace__', function() {
      logger = preacher({
        loggerToWrap,
        enable: 'test:winston',
        doFileLine: true
        })(namespace).spawn('doFileLine');

      let debugTest = runTest({output: 'debug', namespace, regex: /\[.*\:\d*\]/}, () => logger.debug(() => 'debug'));

      let mapped = Promise.map(['info', 'warn', 'error'], lvl =>
        runTest({output: lvl}, () => logger[lvl](() => lvl))
      );

      return Promise.all([debugTest, mapped]);
  });

    return it('child', function() {
      logger = preacher({
        loggerToWrap,
        enable: 'test:winston'
        })(namespace).spawn('doFileLine').spawn('child');

      // console.log(logger)
      // make sure the child does not have file and line number | format | [index.test:64]
      let opts = {
        output: 'debug',
        namespace: namespace + ':doFileLine:child',
        notRegex: /\[.*\:\d*\]/
      };

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
      logger = preacher({
        loggerToWrap,
        enable: 'test:winston'
        })('nothing');

      logger.debug('debug');
      stubbed.debug.called.should.not.be.ok;

      return ['info', 'warn', 'error'].forEach(function(lvl) {
        logger[lvl](lvl);
        return stubbed[lvl].called.should.be.ok;
      });
    });

    return it('lazy', function() {
      let stubbed = sinon.stub(loggerToWrap);
      logger = preacher({
        loggerToWrap,
        enable: 'test:winston'
        })('nothing');

      logger.debug(() => 'debug');
      stubbed.debug.called.should.not.be.ok;

      return ['info', 'warn', 'error'].forEach(function(lvl) {
        logger[lvl](() => lvl);
        return stubbed[lvl].called.should.be.ok;
      });
    });
  });
});
