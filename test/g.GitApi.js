import {describe, it} from 'mocha';
import { assert } from 'chai';

import GitApi from '../src/js/helpers/GitApi.js';
import fs from 'fs-extra';

describe('GitApi.status', function() {
  it ('status should give an error when not in an existing directory ', function(done) {
    GitApi('../invalidFolder').status(function(err, data) {
      assert.isNotNull(err);
      assert.isFalse(data);
      done();
    })
  });
  it ('status should give an error when not in a git repo', function(done) {
    fs.removeSync('../testDir');
    fs.removeSync('../testRepo');
    fs.ensureDirSync('../testDir');
    fs.writeFileSync('../testDir/test.txt', 'sup')
    GitApi('../testDir').status(function(err, data) {
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
    GitApi('../testDir').checkout('master', function(err) {
      assert.isNotNull(err);
      done();
    })
  });
});

describe('GitApi.mirror', function() {
  it ('mirror should give an error when not in an existing directory ', function(done) {
    GitApi('../invalidFolder').mirror('test', '../invalidFolder', function(err) {
      assert.isNotNull(err);
      done();
    })
  });
  it ('mirror should give an error when no data is given ', function(done) {
    GitApi('../invalidFolder').mirror(null, null, function(err) {
      assert.isNotNull(err);
      assert.equal(err, "Missing URL or save path");
      done();
    })
  });

  it ('mirror should clone a git repo into a directory', function(done) {
    GitApi('../testDir').mirror('https://git.door43.org/klappy/blank.git', '../testRepo', function(err) {
      assert.isNull(err);
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
    fs.ensureDirSync('../testDir');
    GitApi('../testDir').add(function(err) {
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
    fs.ensureDirSync('../testDir');
    GitApi('../testDir').init(function(err) {
      assert.isNull(err);
      done();
    })
  });
});

describe('GitApi.add', function() {
  it ('add should add an untracked file to staging', function(done) {
    GitApi('../testDir').add(function(err) {
      GitApi('../testDir').status(function(err, data) {
        assert.isNull(err);
        assert.equal('test.txt', data.created[0])
        done();
      });
    })
  });
});

describe('GitApi.commit', function() {
  it ('commit should commit staged files', function(done) {
    GitApi('../testDir').commit('user', 'test commit', function(err, data) {
      assert.isNull(err);
      assert.isObject(data);
      GitApi('../testDir').status(function(err, data) {
        assert.isNull(err);
        assert.isUndefined(data.created[0])
        done();
      });
    })
  });
});

describe('GitApi.checkout', function() {
  it ('checkout should checkout to master', function(done) {
    GitApi('../testDir').checkout('master', function(err, data) {
      assert.isNull(err);
      GitApi('../testDir').status(function(err, data) {
        assert.isNull(err);
        assert.equal('master', data.current)
        done();
      });
    })
  });
});
