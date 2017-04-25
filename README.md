# preacher
<!-- [![NPM version][npm-image]][npm-url] [![build status][travis-image]][travis-url] -->

## Install
`npm install --save preacher`

## Goal

- To easily integrate visionmedia's [debug](https://github.com/visionmedia/debug) into any javascript logging framework for node or the browser.
- Lazy log level evaluation
- Easy log namespace management via spawning.

## API

### `preacher(options = {})`

### Options:

- ### `loggerToWrap` (required)
  - Logging instance that is wrapped. Typically this would be winston, console or $log (angular).
- ### `debugApi` (optional)
  - A visionmedia debug instance if one is not provided then one is created for you.
- ### `enable` (optional)
  - Comma delimmited string. If it is not defined it defaults to `debug's` `ENV` variable of `DEBUG`.
- ### `levelFns` (optional)
  - Array of strings, typically `['info', 'warn', 'error']`. Levels to evaulate and possibly wrap.
- ### `doFileLine` (optional)
  - boolean defaults to `false`. Currently this is for node only to diplay the file and line number of the log output.
- ### `decorLevels` (optional)
  - Array of strings, typically `['info', 'warn', 'error']`. Levels to add lazy evaluation and decorations (color-wrap, file info) to.

Basic Example:
```js
const preacher = require('preacher');

console.debug = console.log; // for example for node, no need in the browser

const rootLogger = preacher({
  loggerToWrap: console, // or $log
  enable: 'demo,other', //,hidden uncomment to unhide
  doFileLine: true});

const demoLogger = rootLogger('demo');
const otherLogger = rootLogger('other');
const hiddenLogger = rootLogger('hidden');

const log1 = demoLogger.spawn('worker1');
const log2 = demoLogger.spawn('worker2');
const log3 = demoLogger.spawn('worker3');
const log4 = otherLogger.spawn('worker4');

const log5 = hiddenLogger.spawn('worker5');

log1.error('not really an error.');
log1.info('info');
log1.warn('not really a warning.');
setInterval( () => log1.debug('one'), 1000);
setInterval( () => log1.debug.red('red'), 1000); // works but color is only for node
setInterval(() =>  log2.debug(() => 'two'), 1100);
setInterval(() =>  log3.debug('three'), 1200);
setInterval(() =>  log4.debug(() => 'four'), 1150);
setInterval(() =>  {
  // notice nothing is logged
  hiddenLogger.debug(() => 'hidden root');
  log5.debug(() => 'five');
}, 1155);
```

[npm-image]: https://img.shields.io/npm/v/preacher.svg
[npm-url]: https://www.npmjs.com/package/preacher
[travis-image]: https://img.shields.io/travis/nmccready/preacher.svg
[travis-url]: https://travis-ci.org/nmccready/preacher
