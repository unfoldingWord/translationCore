import {describe, it} from 'mocha';
import {assert} from 'chai';
import path from 'path-extra';
import fs from 'fs-extra';
//helpers
import * as loadOnline from '../src/js/helpers/LoadOnlineHelpers';

const badSave = path.join(path.homedir(), 'translationCore', 'projects', 'id_-cfksl');

describe('loadOnline.openManifest', function() {
  it('loadOnline.openManifest should return an error if no link is specified', function(done) {
    loadOnline.openManifest(null, function(err, savePath, url) {
      assert.isString(err.text);
      assert.isNull(savePath);
      assert.isNull(url);
      assert.equal(err.text, 'No link specified');
      done();
    });
  });
  it('loadOnline.openManifest should fail on an invalid link.', function(done){
    fs.removeSync(badSave);
    this.timeout(10000);
    loadOnline.openManifest('https://git.door43.org/klappy/noprojecthere.git', function(err, savePath, url) {
      assert.isNull(savePath);
      assert.isNull(url);
      assert.isString(err.text);
      done();
    });
  });

  it('loadOnline.openManifest should not deny a non .git link.', function(done){
    this.timeout(20000);
    var expectedSavePath = path.join(path.homedir(), 'translationCore', 'projects', 'bhadrawahi_tit');
    var expectedURL = 'https://git.door43.org/klappy/bhadrawahi_tit';
    loadOnline.openManifest(expectedURL, function(err, savePath, url) {
      assert.equal(savePath, expectedSavePath);
      assert.equal(url, expectedURL+'.git');
      fs.removeSync(savePath);
      done();
    });
  });

  it('loadOnline.openManifest should return the home directory and url', function(done){
    this.timeout(20000);
    var expectedSavePath = path.join(path.homedir(), 'translationCore', 'projects', 'bhadrawahi_tit');
    var expectedURL = 'https://git.door43.org/klappy/bhadrawahi_tit.git';
    loadOnline.openManifest(expectedURL, function(err, savePath, url) {
      assert.equal(savePath, expectedSavePath);
      assert.equal(url, expectedURL);
      done();
    });
  });
});
