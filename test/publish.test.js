'use strict';

var exec = require('child_process').exec;

function cleanUp(cb) {
  return exec('rm -rf ./tmp', cb);
}

function makeTestPackage(cb) {
  return exec('./scripts/mockPublish', cb);
}

describe('publish: can load a published version', function() {
  it('publish: can load a published version', function(done) {
    this.timeout(10000);
    cleanUp(function() {
      makeTestPackage(function() {
        try {
          // attempt to load a packed / unpacked potential deployed version
          require('../tmp/package/dist');
        }
        catch (error){
          throw error;
        }
        finally{
          cleanUp(function() {
            done()
          });
        }
      });
    });
  });
});
