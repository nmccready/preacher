const stackTrace = require('stack-trace');
const path = require('path');


let getFileAndLine = function(trace, index) {
  let filename;
  let fileinfo = path.parse(trace[index].getFileName());
  if (fileinfo.name === 'index') {
    filename = `${path.basename(fileinfo.dir)}/index`;
  } else {
    filename = fileinfo.name;
  }
  return {
    filename,
    lineNumber: trace[index].getLineNumber()
  };
};

let decorateOutput = (func, bindThis) =>
  function(...args) {
    // this gets correct coffee, typescript line, where stackTrace.get() does not
    let trace = stackTrace.parse(new Error());
    let info = getFileAndLine(trace, 1);
    if (info.filename === 'color-wrap/index') {
      info = getFileAndLine(trace, 2);
    }
    let decorator = `[${info.filename}:${info.lineNumber}]`;

    args.unshift(decorator);
    // this allows passing a function to be evaluated only if logging will take place
    if (typeof(args[1]) === 'function') {
      args[1] = args[1]();
    }
    return func.apply(bindThis, args);
  }
;

let resolveOutput = (func, bindThis) =>
  function(...args) {
    // this allows passing a function to be evaluated only if logging will take place
    if (typeof(args[0]) === 'function') {
      args[0] = args[0]();
    }
    return func.apply(bindThis, args);
  }
;


module.exports =  {
  getFileAndLine,
  decorateOutput,
  resolveOutput
};
