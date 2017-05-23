const assert = require('chai').assert;
const loadOnline = require('../src/js/components/core/LoadOnline.js');
const path = require('path-extra');
const fs = require('fs-extra');

const badSave = path.join(path.homedir(), 'translationCore', 'id_-cfksl');


describe('loadOnline.openManifest', function() {
  it('loadOnline.openManifest should return an error if no link is specified', function(done) {
    loadOnline(null, function(err, savePath, url) {
      assert.isString(err.text);
      assert.isNull(savePath);
      assert.isNull(url);
      assert.equal(err.text, 'No link specified');
      done();
    });
  });
  it('loadOnline.openManifest should fail on an invalid link.', function(done){
    fs.removeSync(badSave);
    this.timeout(500000);
    loadOnline('https://git.door43.org/ianhoegen123/id_-cfksl.git', function(err, savePath, url) {
      assert.isNull(savePath);
      assert.isNull(url);
      assert.isString(err.text);
      done();
    });
  });

  it('loadOnline.openManifest should not deny a non .git link.', function(done){
    this.timeout(50000);
    var expectedSavePath = path.join(path.homedir(), 'translationCore', 'id_-co_text_reg');
    var expectedURL = 'https://git.door43.org/royalsix/id_-co_text_reg';
    loadOnline(expectedURL, function(err, savePath, url) {
      assert.equal(savePath, expectedSavePath);
      assert.equal(url, expectedURL+'.git');
      fs.removeSync(savePath);
      done();
    });
  });

  it('loadOnline.openManifest should return the home directory and url', function(done){
    this.timeout(50000);
    var expectedSavePath = path.join(path.homedir(), 'translationCore', 'id_-co_text_reg');
    var expectedURL = 'https://git.door43.org/royalsix/id_-co_text_reg.git';
    loadOnline(expectedURL, function(err, savePath, url) {
      assert.equal(savePath, expectedSavePath);
      assert.equal(url, expectedURL);
      done();
    });
  });
});
