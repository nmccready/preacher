const hook = require('hook-std');
const Promise = require('bluebird');
let debug = require('../../src/debug').spawn('hookHelper');
// fs = require('fs')

let test = function(...args) { let obj = args[0],
  { output,
  namespace,
  regex,
  notRegex } = obj,
  val = obj.std,
  std = val != null ? val : 'stderr'; return new Promise(function(resolve, reject) {
  let unhook;
  debug({output, namespace, regex, notRegex});
  return unhook = hook[std](function(str) {
    try {
      // fs.writeFileSync __dirname + '/test.log', """
      //   #{JSON.stringify({output, namespace, regex, notRegex})}
      //   str: #{str}
      // """
      let namespaceTest, notRegexTest, regexTest;
      str.should.to.be.ok;
      let outputTest = RegExp(output).test(str);
      outputTest.should.be.ok;
      if (namespace != null) {
        namespaceTest = RegExp(namespace).test(str);
        namespaceTest.should.be.ok;
      }

      if (regex != null) {
        regexTest = regex.test(str);
        regexTest.should.be.ok;
      }

      if (notRegex != null) {
        notRegexTest = notRegex.test(str);
        notRegexTest.should.not.be.ok;
      }

      unhook();
      resolve();
      if (regexTest != null) {
        debug(`regexTest:${output}: ${regexTest}`);
      }
      if (notRegex != null) {
        debug(`notRegexTest:${output}: ${notRegexTest}`);
      }
      debug(`outputTest:${output}: ${outputTest}`);
      if (namespace != null) {
        debug(`namespaceTest:${output}: ${namespaceTest}`);
      }
      return debug(`unhooked: ${output}`);
    } catch (e) {
      return reject(e);
    }
  });
}); };


let runTest = function({output, namespace, regex, notRegex}, initCb) {
  let promise = test({output, namespace, regex, notRegex});
  initCb();
  return promise;
};

module.exports =  {
  test,
  runTest
};
