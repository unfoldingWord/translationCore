const assert = require('chai').assert;
const loadOnline = require('../src/js/components/core/LoadOnline.js');
const path = require('path-extra');

describe('loadOnline.openManifest', function() {
  it('loadOnline.openManifest should deny a non .git link.', function(done){
    loadOnline('https://git.door43.org/royalsix/id_-co_text_reg', function(err, savePath, url) {
      assert.isNull(savePath);
      assert.isNull(url);
      assert.equal(err, 'Invalid Project, URL needs to end with .git');
      done();
    });
  });
  it('loadOnline.openManifest should return the home directory and url', function(done){
    this.timeout(500000);
    var expectedSavePath = path.join(path.homedir(), 'translationCore', 'id_-co_text_reg');
    var expectedURL = 'https://git.door43.org/royalsix/id_-co_text_reg.git';
    loadOnline(expectedURL, function(err, savePath, url) {
      assert.equal(savePath, expectedSavePath);
      assert.equal(url, expectedURL);
      done();
    });
  });

})
