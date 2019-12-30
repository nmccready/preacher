/* eslint-disable no-unused-expressions */
const hook = require('hook-std');
const Promise = require('bluebird');
const debug = require('../../src/debug').spawn('hookHelper');
// fs = require('fs')

const test = (...args) => {
  const [obj] = args;
  const { output, namespace, regex, notRegex, std: val } = obj;
  const std = val != null ? val : 'stderr';
  return new Promise((resolve, reject) => {
    let unhook;
    debug({ output, namespace, regex, notRegex });
    // eslint-disable-next-line no-return-assign
    return (unhook = hook[std]((str) => {
      try {
        // fs.writeFileSync __dirname + '/test.log', """
        //   #{JSON.stringify({output, namespace, regex, notRegex})}
        //   str: #{str}
        // """
        let namespaceTest, notRegexTest, regexTest;
        str.should.to.be.ok;
        const outputTest = RegExp(output).test(str);
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
    }));
  });
};

const runTest = ({ output, namespace, regex, notRegex }, initCb) => {
  const promise = test({ output, namespace, regex, notRegex });
  initCb();
  return promise;
};

module.exports = {
  test,
  runTest,
};
