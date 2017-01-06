/**
 * @author Ian Hoegen
 * @description Tests for Git Api.
 ******************************************************************************/

const assert = require('chai').assert;
const GitApi = require('../src/js/components/core/GitApi.js');
const GitSync = require('../src/js/components/core/SideBar/GitSync.js');
const fs = require('fs-extra');
/**
 * Sync
 * checkout
 */

 describe('GitApi.status', function() {
   it ('status should give an error when not in an existing directory ', function(done) {
     GitApi('../invalidFolder').status(function(err, data) {
       assert.isNotNull(err);
       assert.isFalse(data);
       done();
     })
   });
   it ('status should give an error when not in a git repo', function(done) {
     fs.removeSync('../hello');
     fs.ensureDirSync('../hello');
     fs.writeFileSync('../hello/test.txt', 'sup')
     GitApi('../hello').status(function(err, data) {
       assert.isNotNull(err);
       assert.isFalse(data);
       done();
     })
   });
   it('status should give the status of the current repo', function(done) {
     GitApi().status(function(err, data) {
       assert.isNull(err);
       assert.isObject(data);
       assert.isString(data.current)
       done();
     })
   });
 });

  describe('GitApi.checkout', function() {
    it ('checkout should give an error when not in an existing directory ', function(done) {
      GitApi('../invalidFolder').checkout('test', function(err) {
        assert.isNotNull(err);
        done();
      })
    });
    it ('checkout should give an error when no branch is given ', function(done) {
      GitApi('../invalidFolder').checkout(null, function(err) {
        assert.isNotNull(err);
        assert.equal(err, "No branch");
        done();
      })
    });

    it ('checkout should give an error when not in a git repo', function(done) {
      GitApi('../hello').checkout('master', function(err) {
        assert.isNotNull(err);
        done();
      })
    });
  });

 describe('GitApi.add', function() {
   it ('add should give an error when not in an existing directory ', function(done) {
     GitApi('../invalidFolder').add(function(err) {
       assert.isNotNull(err);
       done();
     });
   });
   it ('add should give an error when not in a git repo', function(done) {
     fs.ensureDirSync('../hello');
     GitApi('../hello').add(function(err) {
       assert.isNotNull(err);
       done();
     })
   });
   it('add should add files of the current repo', function(done) {
     GitApi().add(function(err) {
       assert.isNull(err);
       done();
     })
   });
 });

 describe('GitApi.init', function() {
   it ('init should give an error when not in an existing directory ', function(done) {
     GitApi('../invalidFolder').init(function(err) {
       assert.isNotNull(err);
       done();
     });
   });
   it ('init should initialize a git repo with no issue', function(done) {
     fs.ensureDirSync('../hello');
     GitApi('../hello').init(function(err) {
       assert.isNull(err);
       done();
     })
   });
 });

 describe('GitApi.add', function() {
   it ('add should add an untracked file to staging', function(done) {
     GitApi('../hello').add(function(err) {
       GitApi('../hello').status(function(err, data) {
         assert.isNull(err);
         assert.equal('test.txt', data.created[0])
         done();
       });
     })
   });
 });

 describe('GitApi.commit', function() {
   it ('commit should commit staged files', function(done) {
     GitApi('../hello').commit('test commit', function(err, data) {
       assert.isNull(err);
       assert.isObject(data);
       GitApi('../hello').status(function(err, data) {
         assert.isNull(err);
         assert.isUndefined(data.created[0])
         done();
       });
     })
   });
 });

 describe('GitApi.checkout', function() {
   it ('checkout should checkout an untracked file to staging', function(done) {
     GitApi('../hello').checkout('master', function(err, data) {
       assert.isNull(err);
       GitApi('../hello').status(function(err, data) {
         assert.isNull(err);
         assert.equal('master', data.current)
         done();
       });
     })
   });
 });
